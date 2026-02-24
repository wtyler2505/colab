const std = @import("std");
const builtin = @import("builtin");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const exe = b.addExecutable(.{
        .name = "llama-cli",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    // Link against libc and C++ for llama.cpp
    exe.linkLibC();
    exe.linkLibCpp();
    
    // Link BLAS — platform-specific
    const native_os = target.result.os.tag;
    if (native_os == .macos) {
        exe.linkFramework("Accelerate");
    } else if (native_os == .linux) {
        // OpenBLAS provides BLAS/LAPACK on Linux (install: apt install libopenblas-dev)
        exe.linkSystemLibrary("openblas");
    }
    
    // Add include paths
    exe.addIncludePath(b.path("deps/llama.cpp/include"));
    exe.addIncludePath(b.path("deps/llama.cpp/ggml/include"));
    exe.addIncludePath(b.path("src"));
    
    // Link against pre-compiled libraries
    // NOTE: These .a files are currently macOS ARM64 objects built from llama.cpp.
    // For Linux, they must be rebuilt from source:
    //   cd deps/llama.cpp && mkdir -p build && cd build
    //   cmake .. -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS && cmake --build .
    // TODO: Add a Linux build script or CI step to produce Linux .a archives.
    if (native_os == .macos) {
        exe.addObjectFile(b.path("deps/llama.cpp/build/src/libllama.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/ggml/src/libggml.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/ggml/src/libggml-base.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/ggml/src/libggml-cpu.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/common/libcommon.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/ggml/src/ggml-blas/libggml-blas.a"));
    } else if (native_os == .linux) {
        // Linux pre-compiled libraries — same paths, but archives must be built for Linux first.
        // If the Linux .a files exist at these paths (after running the cmake build above), link them.
        exe.addObjectFile(b.path("deps/llama.cpp/build/src/libllama.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/ggml/src/libggml.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/ggml/src/libggml-base.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/ggml/src/libggml-cpu.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/common/libcommon.a"));
        exe.addObjectFile(b.path("deps/llama.cpp/build/ggml/src/ggml-blas/libggml-blas.a"));
    }
    
    // Platform-specific optimizations  
    const target_info = target.result;
    if (target_info.cpu.arch.isX86()) {
        exe.defineCMacro("GGML_USE_AVX", "1");
        exe.defineCMacro("GGML_USE_AVX2", "1");
        exe.defineCMacro("GGML_USE_F16C", "1");
        exe.defineCMacro("GGML_USE_FMA", "1");
    } else if (target_info.cpu.arch.isARM()) {
        exe.defineCMacro("GGML_USE_NEON", "1");
    }
    
    b.installArtifact(exe);

    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());

    if (b.args) |args| {
        run_cmd.addArgs(args);
    }

    const run_step = b.step("run", "Run the app");
    run_step.dependOn(&run_cmd.step);
}
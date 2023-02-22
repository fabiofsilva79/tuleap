extern crate cbindgen;

use std::process::Command;

use cbindgen::Config;

fn main() {
    let crate_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let config = Config::from_file("cbindgen.toml").unwrap();

    cbindgen::generate_with_config(&crate_dir, config)
        .expect("Unable to generate C bindings.")
        .write_to_file("wasmtimewrapper.h");

    Command::new("cargo")
        .args(&[
            "build",
            "--manifest-path",
            "./test-wasm-modules/Cargo.toml",
            "--target",
            "wasm32-wasi",
            "--release",
        ])
        .status()
        .unwrap();

    println!("cargo:rerun-if-changed=src/");
    println!("cargo:rerun-if-changed=test-wasm-modules/");
}

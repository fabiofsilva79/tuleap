# This file has been generated by node2nix 1.9.0. Do not edit!

{nodeEnv, fetchurl, fetchgit, nix-gitignore, stdenv, lib, globalBuildInputs ? []}:

let
  sources = {};
in
{
  "pnpm-^6" = nodeEnv.buildNodePackage {
    name = "pnpm";
    packageName = "pnpm";
    version = "6.32.11";
    src = fetchurl {
      url = "https://registry.npmjs.org/pnpm/-/pnpm-6.32.11.tgz";
      sha512 = "KIb3ImAEGl03aJNy0pai7J0mWn52GJwRrUllxUZwibhLdUoeOuDjXhNSgRxxW9BH2gR91b3UadxzdAvhehmM8w==";
    };
    buildInputs = globalBuildInputs;
    meta = {
      description = "Fast, disk space efficient package manager";
      homepage = "https://pnpm.io";
      license = "MIT";
    };
    production = true;
    bypassCache = true;
    reconstructLock = true;
  };
}

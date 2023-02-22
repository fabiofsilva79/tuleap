{
  pkgs ? (import ../../../tools/utils/nix/pinned-nixpkgs.nix) {},
  nixpkgsPinEpoch ? (import ../../../tools/utils/nix/nixpkgs-pin-epoch.nix) { inherit pkgs; }
}:

let
  baseArchTarget = "x86_64";
  buildTargetRust = "${baseArchTarget}-unknown-linux-musl";
  rustBinWithMuslTarget = pkgs.rust-bin.stable.latest.minimal.override {
    targets = [ buildTargetRust ];
  };
  zigCC = pkgs.writeShellScriptBin "zigcc" ''
    ${pkgs.zig}/bin/zig cc -target ${baseArchTarget}-linux-musl $@
  '';
  tuleapMeilisearchBin = pkgs.stdenvNoCC.mkDerivation rec {
    pname = "tuleap-meilisearch";
    version = "1.0.0";
    src = pkgs.fetchFromGitHub {
      owner = "meilisearch";
      repo = "MeiliSearch";
      rev = "v${version}";
      sha256 = "sha256-XWPJldWxe8iply7XtmDem1gfbNuuaWuFdMfuCbcU6tc=";
    };
    cargoDeps = pkgs.rustPlatform.fetchCargoTarball {
      inherit src;
      sha256 = "sha256-t0TsDn9ZC6/1QmHRnzqhmYfUT7a0qltZEzuQTnwNvlY=";
    };

    nativeBuildInputs = [ pkgs.rustPlatform.cargoSetupHook rustBinWithMuslTarget zigCC ];

    # Tests will try to compile with mini-dashboard features which downloads something from the internet.
    doCheck = false;

    buildPhase = ''
      runHook preBuild
      HOME="$TMPDIR" CC="zigcc" cargo build --release --no-default-features --target ${buildTargetRust}
      runHook postBuild
    '';

    installPhase = ''
      runHook preInstall
      mkdir -p $out/bin/
      cp target/${buildTargetRust}/release/meilisearch $out/bin/${pname}
      runHook postInstall
    '';
  };
  tuleapVersion = builtins.readFile ../../../VERSION;
in pkgs.stdenvNoCC.mkDerivation {
  name = "tuleap-meilisearch-server-rpm-package";
  srcs = [
    "${tuleapMeilisearchBin}/bin/tuleap-meilisearch"
    ./tuleap-meilisearch-server/tuleap-meilisearch.service
  ];

  nativeBuildInputs = [ pkgs.rpm ];

  dontConfigure = true;

  unpackPhase = ''
    for srcFile in $srcs; do
     cp -a $srcFile $(stripHash $srcFile)
    done
  '';

  buildPhase = ''
    rpmbuild \
     --define "tuleap_version ${tuleapVersion}" \
     --define "nixpkgs_epoch .${nixpkgsPinEpoch}" \
     --define "_sourcedir $(pwd)" \
     --define "_rpmdir $(pwd)" \
     --dbpath="$(pwd)"/rpmdb \
     --define "%_topdir $(pwd)" \
     --define "%_tmppath %{_topdir}/TMP" \
     --define "_rpmdir $(pwd)/RPMS" \
     --define "%_bindir /usr/bin" \
     --define "%_unitdir /usr/lib/systemd/system" \
     -bb ${./tuleap-meilisearch-server/tuleap-meilisearch-server.spec}
  '';

  installPhase = ''
    mkdir $out/
    mv RPMS/${baseArchTarget}/*.rpm $out/
  '';

  dontFixUp = true;
}

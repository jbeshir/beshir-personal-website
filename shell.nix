with (import (fetchTarball https://github.com/nixos/nixpkgs/archive/86d8a4876235f9600439401efad8b957ea3a5c26.tar.gz) {});

mkShell {
  buildInputs = [
    git
    nodejs-16_x
  ];
}
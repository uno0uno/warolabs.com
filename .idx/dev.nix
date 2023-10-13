{ pkgs, ... }: {
  channel = "stable-23.05"; # "stable-23.05" or "unstable"
  packages = [
    pkgs.nodejs
    pkgs.nodePackages.firebase-tools
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
  idx.previews = {
    enable = true;
    previews = [
      {
        command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
        manager = "web";
        id = "web";
      }
    ];
  };
}
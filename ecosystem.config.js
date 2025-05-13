module.exports = {
  apps: [
    {
      name: "code_01",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
      watch: false,
      max_memory_restart: "500M",
      instances: 1,
      exec_mode: "fork",
    },
  ],
}; 
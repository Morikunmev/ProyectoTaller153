const path = require("path");

module.exports = {
  entry: {
    envio: "./src/envio.js",
    factura: "./src/factura.js",
    proveedor: "./src/proveedor.js",
    dashboard: "./src/dashboard.js",
    material: "./src/material.js",
    herramienta: "./src/herramienta.js",
    producto: "./src/producto.js", 
    categoria: "./src/categoria.js", 
    perdida: "./src/perdida.js", 
    venta: "./src/venta.js", 
    cliente: "./src/cliente.js", 
    colaborador: "./src/colaborador.js",
    administrador: "./src/administrador.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    publicPath: "/static/js/react/dist/",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              url: false, // Desactiva el manejo de URLs en CSS
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("tailwindcss"), require("autoprefixer")],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devtool:
    process.env.NODE_ENV === "production" ? "source-map" : "eval-source-map",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  performance: {
    hints: process.env.NODE_ENV === "production" ? "warning" : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};

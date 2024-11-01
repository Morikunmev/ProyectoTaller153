const path = require('path');

module.exports = {
    // Puntos de entrada para cada página que usará React
    entry: {
        envio: './src/envio.js',        // Generará envio.bundle.js
        factura: './src/factura.js',     // Generará factura.bundle.js
        proveedor: './src/proveedor.js'  // Generará proveedor.bundle.js
    },
    // Configuración de salida
    output: {
        path: path.resolve(__dirname, 'dist'), // Los archivos compilados irán a la carpeta dist
        filename: '[name].bundle.js',          // [name] será reemplazado por cada key en entry
    },
    // Reglas para procesar diferentes tipos de archivos
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,              // Procesar archivos .js y .jsx
                exclude: /node_modules/,           // No procesar archivos en node_modules
                use: {
                    loader: 'babel-loader',        // Usar babel para transpilar
                    options: {
                        presets: [
                            '@babel/preset-env',   // Para características modernas de JS
                            '@babel/preset-react'  // Para JSX
                        ],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }
            },
            {
                test: /\.css$/,                   // Procesar archivos CSS
                use: [
                    'style-loader',               // Inyecta los estilos en el DOM
                    {
                        loader: 'css-loader',     // Interpreta @import, url() etc.
                        options: {
                            importLoaders: 1      // Número de loaders que se aplicarán antes de css-loader
                        }
                    },
                    'postcss-loader'             // Procesa CSS con PostCSS (necesario para Tailwind)
                ]
            }
        ]
    },
    // Configuración para resolver importaciones
    resolve: {
        extensions: ['.js', '.jsx']  // Permite importar archivos sin especificar estas extensiones
    },
    // Source maps para mejor debugging
    devtool: 'source-map',
    // Modo desarrollo, cambiar a 'production' para producción
    mode: 'development'
};
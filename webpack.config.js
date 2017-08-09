module.exports = {
  entry: ["./src/index.js"],
  output: {
    path: "./public",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ["babel-loader"], exclude: /node_modules/ }
    ]
  }
};

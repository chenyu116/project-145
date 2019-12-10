module.exports = {
	transpileDependencies: ["vuetify"],
	productionSourceMap: false,
	assetsDir: process.env.NODE_ENV === "production" ? "v2" : "",
	publicPath:
		process.env.NODE_ENV === "production"
			? "https://o.signp.cn/project/145/"
			: "/",
	pluginOptions: {
		i18n: {
			enableInSFC: false
		}
	}
};

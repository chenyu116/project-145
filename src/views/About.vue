<template>
	<v-layout fill-height="">
		<HeaderWithBack title="about" icon="fa-file-alt"></HeaderWithBack>
		<v-overlay opacity="1" v-show="panoramaFullScreen">
			<v-row no-gutters="" align="start" justify="start">
				<v-col cols="12">
					<v-btn
						@click="
							panoramaFullScreen = false;
							showPanorama = '';
						"
						fixed=""
						fab
						top
						right
						color="lime"
						x-small=""
						elevation="1"
						class="black--text"
					>
						<v-icon dense="">fa-times</v-icon>
					</v-btn>
					<!-- <div
						id="panorama"
						:style="
							`height:${$store.state.windowHeight}px;width:${$store.state.windowWidth}px;`
						"
					></div> -->
					<v-pannellum
						:style="
							`height:${$store.state.windowHeight}px;width:${$store.state.windowWidth}px;`
						"
						:src="showPanorama"
					></v-pannellum>
				</v-col>
			</v-row>
		</v-overlay>
		<v-container fluid="" class="mt-12">
			<v-row no-gutters="">
				<v-col cols="12">
					<v-card flat="">
						<template v-if="!loading.fail">
							<v-skeleton-loader :loading="loading.content" type="article">
								<v-card-title
									><v-row justify="center">
										{{ details.article_title }}</v-row
									></v-card-title
								>
								<v-divider></v-divider>
								<v-col cols="12" v-show="panorama.length > 0">
									<v-card-subtitle class="subtitle-1 font-weight-bold"
										><v-icon left dense="" color="lime lighten-3"
											>fa-bookmark</v-icon
										>{{ $t("panorama360") }}</v-card-subtitle
									>
									<template v-for="(item, index) in panorama">
										<img
											:key="index"
											:src="ossHost + item"
											class="point-details-gallery-panorama"
											@click="showPanoramaView(item)"
										/>
									</template>
								</v-col>
								<v-card-subtitle class="subtitle-1 font-weight-bold"
									><v-icon left dense="" color="lime lighten-3"
										>fa-bookmark</v-icon
									>{{ $t("description") }}</v-card-subtitle
								>
								<v-card-text
									v-html="details.article_content"
									class="r-content subtitle-1"
								></v-card-text> </v-skeleton-loader
						></template>
					</v-card>
				</v-col>
			</v-row>
			<v-layout
				fill-height=""
				align-center=""
				justify-center=""
				v-if="loading.fail"
			>
				<v-btn v-if="id > 0" @click="loadArticle(id)" depressed="">
					<v-icon left dense="">fa-redo</v-icon>
					<span class="">{{ $t("regry") }}</span>
				</v-btn>
				<p v-if="id === 0">未定义文章信息</p>
			</v-layout>
		</v-container>
	</v-layout>
</template>

<script>
export default {
	components: {},
	computed: {
		id() {
			const pages = this.$store.state.startPointInfo.project_pages.split(";");
			for (let i = 0; i < pages.length; i++) {
				const page = pages[i].split(",");
				if (page.indexOf("about-" + this.$i18n.locale) > -1) {
					return page[1] > 0 ? page[1] : 0;
				}
			}
			return 0;
		}
	},
	mounted() {
		if (this.id > 0) {
			this.loadArticle(this.id);
		} else {
			this.loading.fail = true;
		}
	},
	watch: {
		details: {
			handler(val) {
				if (this.panorama.length === 0 && val.map_polygon_details_panorama) {
					this.panorama = val.map_polygon_details_panorama.split(",");
				}
			},
			deep: true
		}
	},
	data() {
		return {
			loading: {
				content: true,
				fail: false
			},
			details: {},
			showPanorama: "",
			panorama: [],
			panoramaFullScreen: false
		};
	},
	methods: {
		loadArticle(id) {
			const _this = this;
			_this.loading.fail = false;
			_this.loading.content = true;
			const readStore = _this.$store.state.db
				.transaction("article")
				.objectStore("article")
				.get(id);
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				const nowTime = new Date().getTime();
				if (r && r.timestamp > nowTime) {
					_this.details = r.val;
					_this.loadDetails(_this.$store.state.startPointInfo.main_map_gid);
				} else {
					_this.$http
						.get(_this.apiHost + "/article", {
							params: {
								id: id,
								project_id: _this.$store.state.startPointInfo.project_id,
								timestamp: parseInt(new Date().getTime() / 1000)
							}
						})
						.then(
							function(resp) {
								if (resp.status === 200 && resp.body) {
									const timestamp = new Date().getTime() + 300 * 1000;
									const writeStore = _this.$store.state.db
										.transaction("article", "readwrite")
										.objectStore("article");
									writeStore.put({
										id: id,
										timestamp: timestamp,
										val: resp.body
									});
									_this.details = resp.body;
									_this.loadDetails(
										_this.$store.state.startPointInfo.main_map_gid
									);
								} else {
									_this.loading.fail = true;
								}
							},
							function() {
								_this.loading.fail = true;
								_this.loading.content = false;
							}
						);
				}
			};
		},
		loadDetails(id) {
			const _this = this;
			_this.loading.fail = false;
			const readStore = _this.$store.state.db
				.transaction("mapPolygons")
				.objectStore("mapPolygons")
				.get(id);
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				if (r && r.map_polygon_details_content) {
					for (let i in r) {
						if (i.indexOf("map_polygon_details") === 0) {
							_this.$set(_this.details, i, r[i]);
						}
					}
					_this.loading.content = false;
				} else {
					_this.loadDescription(id);
				}
			};
			readStore.onerror = function() {
				_this.loading.fail = true;
			};
		},
		loadDescription(id) {
			this.loading.content = true;
			const _this = this;
			_this.$http
				.get(_this.apiHost + "/polygon/details", {
					params: {
						map_gid: id,
						project_id: _this.$store.state.startPointInfo.project_id,
						timestamp: parseInt(new Date().getTime() / 1000)
					}
				})
				.then(
					function(resp) {
						if (resp.status === 200 && resp.body) {
							for (let i in resp.body) {
								if (i.indexOf("map_polygon_details") === 0) {
									if (
										i === "map_polygon_details_voice" ||
										i === "map_polygon_details_content"
									) {
										_this.$set(_this.details, i, JSON.parse(resp.body[i]));
									} else {
										_this.$set(_this.details, i, resp.body[i]);
									}
								}
							}
						}
						_this.loading.content = false;
					},
					function() {
						_this.loading.content = false;
					}
				);
		},
		showPanoramaView(image) {
			this.showPanorama = this.ossHost + image + "?v=" + new Date().getTime();
			/*if (this.panoramaView["viewer"] !== undefined) {
				this.panoramaView["viewer"].destroy();
				delete this.panoramaView["viewer"];
			}
			const viewerConfig = {
				showFullscreenCtrl: false,
				orientationOnByDefault: false,
				type: "equirectangular",
				panorama: image,
				autoLoad: true,
				showControls: true,
				showZoomCtrl: false,
				minPitch: -60,
				hfov: 100,
				pitch: 0,
				yaw: 0
			};

			this.panoramaView["viewer"] = window.pannellum.viewer(
				"panorama",
				viewerConfig
			);*/
			this.panoramaFullScreen = true;
		}
	}
};
</script>
<style>
.r-content img {
	width: 100% !important;
}
</style>
<style scoped>
.point-details-gallery-panorama {
	width: 6em;
	height: 3.5em;
	margin-left: 0.8em;
}
</style>

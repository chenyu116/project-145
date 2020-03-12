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
									<v-card color="white" flat="" tile="">
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
									</v-card>
									<v-divider class=" lime darken-1"></v-divider>
								</v-col>
								<v-col cols="12" v-show="images.length > 0">
									<v-card color="white" flat="" tile="">
										<v-card-subtitle class="subtitle-1 font-weight-bold"
											><v-icon left dense="" color="lime lighten-3"
												>fa-bookmark</v-icon
											>{{ $t("album") }}</v-card-subtitle
										>
										<template v-for="(item, index) in images">
											<img
												:key="index"
												:src="ossHost + item"
												preview="0"
												class="point-details-gallery-img"
											/>
										</template>
									</v-card>
									<v-divider class=" lime darken-1"></v-divider>
								</v-col>
								<v-col cols="12" v-if="details.article_voice">
									<v-card color="white" flat="">
										<v-card-subtitle class="subtitle-1  font-weight-bold"
											><v-icon left dense="" color="lime lighten-3"
												>fa-bookmark</v-icon
											>{{ $t("voiceIntro") }}</v-card-subtitle
										>
										<v-card-text>
											<v-row no-gutters="" justify="center">
												<audio
													id="audioIntro"
													:src="ossHost + details.article_voice"
													preload=""
													controls
												/>
											</v-row>
										</v-card-text>
									</v-card>
									<v-divider class=" lime darken-1"></v-divider>
								</v-col>
								<v-col cols="12" v-if="details.article_video">
									<v-card color="white" flat="">
										<v-card-subtitle class="subtitle-1  font-weight-bold"
											><v-icon left dense="" color="lime lighten-3"
												>fa-bookmark</v-icon
											>{{ $t("videoIntro") }}</v-card-subtitle
										>
										<v-card-text>
											<v-row no-gutters="" justify="center">
												<video
													id="videoIntro"
													:src="ossHost + details.article_video"
													height="200"
													:width="$store.state.windowWidth - 52"
													:autoplay="false"
													:preload="false"
													controls
												></video>
											</v-row>
										</v-card-text>
									</v-card>
									<v-divider class=" lime darken-1"></v-divider>
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
					<span class="">{{ $t("retry") }}</span>
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
			images: [],
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
					if (_this.details.article_panorama) {
						_this.panorama = _this.details.article_panorama.split(",");
					}
					if (_this.details.article_images) {
						_this.images = _this.details.article_images.split(",");
					}
					_this.loading.content = false;
					_this.$previewRefresh();
				} else {
					_this.$http
						.get(_this.apiHost + "/article", {
							params: {
								id: id,
								project_id: _this.$store.state.startPointInfo.project_id,
								timestamp: parseInt(nowTime / 1000)
							}
						})
						.then(
							function(resp) {
								if (resp.status === 200 && resp.body) {
									const timestamp = nowTime + 300 * 1000;
									const writeStore = _this.$store.state.db
										.transaction("article", "readwrite")
										.objectStore("article");
									writeStore.put({
										id: id,
										timestamp: timestamp,
										val: resp.body
									});
									_this.details = resp.body;
									if (_this.details.article_panorama) {
										_this.panorama = _this.details.article_panorama.split(",");
									}
									if (_this.details.article_images) {
										_this.images = _this.details.article_images.split(",");
									}
									_this.loading.content = false;
									_this.$previewRefresh();
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
.point-details-gallery-img {
	width: 5em;
	height: 5em;
	margin-left: 0.8em;
}
.point-details-gallery-panorama {
	width: 7em;
	height: 4em;
	margin-left: 0.8em;
}
</style>

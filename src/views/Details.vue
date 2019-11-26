<template>
	<v-layout fill-height="" align-start="" justify-center="">
		<HeaderWithBack
			title="attractionsDetails"
			icon="fa-file-alt"
		></HeaderWithBack>
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
						:minPitch="-60"
					></v-pannellum>
				</v-col>
			</v-row>
		</v-overlay>
		<v-row v-if="!loading.fail" no-gutters="" class="mt-12">
			<!-- <v-col cols="12" class="pt-2">
				<v-skeleton-loader
					:loading="images.length === 0"
					transition="scale-transition"
					height="200"
					type="image"
				>
					<v-carousel
						height="200"
						cycle=""
						:show-arrows="false"
						:interval="3000"
						hide-delimiter-background
					>
						<v-carousel-item v-for="(b, i) in images" :key="i">
							<v-card flat="" tile="">
								<v-img
									@click="imageClick(b)"
									:src="ossHost + b"
									height="200"
									:max-width="windowWidth"
									background-color="white"
								></v-img>
							</v-card>
						</v-carousel-item>
					</v-carousel>
				</v-skeleton-loader>
			</v-col> -->
			<v-col cols="12" class="pt-2">
				<v-card color="white" flat="">
					<v-card-title class=" deep-orange--text headline"
						>{{ $t(details.name) }}
						<v-spacer></v-spacer>
						<v-btn depressed="" @click="route(details)"
							><v-icon left="" dense="">fa-location-arrow</v-icon
							>{{ $t("mapIt") }}</v-btn
						>
					</v-card-title>
					<v-card-subtitle>{{
						address && address["add-" + $i18n.locale]
							? address["add-" + $i18n.locale]
							: ""
					}}</v-card-subtitle>
				</v-card>
			</v-col>
			<v-col cols="12" v-if="events.length > 0">
				<v-divider class=" lime darken-1"></v-divider>
				<v-card color="white" flat="">
					<v-card-subtitle class="subtitle-1 font-weight-bold"
						><v-icon left dense="" color="lime lighten-3" class=" "
							>fa-bookmark</v-icon
						>{{ $t("activity") }}
					</v-card-subtitle>
					<v-list :max-width="windowWidth" dense="">
						<v-list-item v-for="(item, index) in events" :key="index">
							<v-list-item-avatar
								><v-icon left dense="" color="red lighten-3" class=" "
									>fa-star</v-icon
								></v-list-item-avatar
							>
							<v-list-item-content class="subtitle-2"
								>{{ item.title }}{{ item.title }}</v-list-item-content
							>
						</v-list-item>
					</v-list>
				</v-card>
			</v-col>
			<!-- <v-col cols="12" v-if="panorama.length > 0">
				<v-divider class=" lime darken-1"></v-divider>
				<v-card color="white" flat="">
					<v-card-subtitle class="subtitle-1 font-weight-bold"
						><v-icon left dense="" color="lime lighten-3" class=" "
							>fa-bookmark</v-icon
						>{{ $t("panorama360") }}
						<v-btn
							color="lime lighten-3"
							depressed=""
							class=" float-right"
							@click="panoramaFullScreen = true"
						>
							<v-icon left>fa-expand</v-icon>
							<span>{{ $t("fullScreen") }}</span>
						</v-btn>
					</v-card-subtitle>
					<v-row no-gutters="" justify="center" class="pl-4 pr-4 pb-4">
						<v-pannellum
							style="height:200px;"
							:src="ossHost + panorama[0]"
							:minPitch="-60"
						></v-pannellum>
					</v-row>
				</v-card>
			</v-col> -->
			<v-col cols="12" v-show="panorama.length > 0">
				<v-divider class=" lime darken-1"></v-divider>
				<v-card color="white" flat="" tile="">
					<v-card-subtitle class="subtitle-1 font-weight-bold"
						><v-icon left dense="" color="lime lighten-3">fa-bookmark</v-icon
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
			</v-col>
			<v-col cols="12" v-show="images.length > 0">
				<v-divider class=" lime darken-1"></v-divider>
				<v-card color="white" flat="" tile="">
					<v-card-subtitle class="subtitle-1 font-weight-bold"
						><v-icon left dense="" color="lime lighten-3">fa-bookmark</v-icon
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
			</v-col>
			<v-col cols="12">
				<v-divider class=" lime darken-1"></v-divider>
				<v-card color="white" flat="">
					<v-card-subtitle class="subtitle-1 font-weight-bold"
						><v-icon left dense="" color="lime lighten-3">fa-bookmark</v-icon
						>{{ $t("surrounding") }}</v-card-subtitle
					>
					<v-bottom-navigation
						:class="`elevation-0`"
						grow=""
						:width="windowWidth"
					>
						<v-btn
							v-for="(item, index) in surrounding"
							:key="index"
							:width="navWidth"
							@click="searchSurrounding(item)"
						>
							<span class="subtitle-2">{{ $t(item.text) }}</span>
							<v-icon>{{ item.icon }}</v-icon>
						</v-btn>
					</v-bottom-navigation>
				</v-card>
			</v-col>
			<v-col
				cols="12"
				v-if="
					details.map_polygon_details_voice &&
						details.map_polygon_details_voice[$i18n.locale] !== ''
				"
			>
				<v-divider class=" lime darken-1"></v-divider>
				<v-card color="white" flat="">
					<v-card-subtitle class="subtitle-1  font-weight-bold"
						><v-icon left dense="" color="lime lighten-3">fa-bookmark</v-icon
						>{{ $t("voiceIntro") }}</v-card-subtitle
					>
					<v-card-text>
						<v-row no-gutters="" justify="center">
							<audio
								id="audioIntro"
								:src="ossHost + details.map_polygon_details_voice[$i18n.locale]"
								preload=""
								controls
							/>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" v-if="details.map_polygon_details_video">
				<v-divider class=" lime darken-1"></v-divider>
				<v-card color="white" flat="">
					<v-card-subtitle class="subtitle-1  font-weight-bold"
						><v-icon left dense="" color="lime lighten-3">fa-bookmark</v-icon
						>{{ $t("videoIntro") }}</v-card-subtitle
					>
					<v-card-text>
						<v-row no-gutters="" justify="center">
							<video
								id="videoIntro"
								:src="ossHost + details.map_polygon_details_video"
								height="200"
								:width="windowWidth - 32"
								:autoplay="false"
								:preload="false"
								controls
							></video>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>

			<v-col cols="12" v-if="details.map_polygon_details_content">
				<v-divider class=" lime darken-1"></v-divider>
				<v-card color="white" flat="">
					<v-card-subtitle class="subtitle-1 font-weight-bold"
						><v-icon left dense="" color="lime lighten-3">fa-bookmark</v-icon
						>{{ $t("description") }}</v-card-subtitle
					>
					<v-skeleton-loader
						:loading="loading.content"
						transition="scale-transition"
						type="article"
					>
						<v-card-text
							v-if="details.map_polygon_details_content"
							v-html="details.map_polygon_details_content[$i18n.locale]"
							class="r-content subtitle-1"
						></v-card-text>
						<!-- <v-row
							no-gutters=""
							v-if="!details.map_polygon_details_content"
							justify="center"
							class="mb-10"
						>
							<v-btn @click="loadDescription(id)" depressed="">
								<v-icon left dense="">fa-redo</v-icon>
								<span class="">{{ $t("retry") }}</span>
							</v-btn>
						</v-row> -->
					</v-skeleton-loader>
				</v-card>
			</v-col>
		</v-row>
		<!-- <v-layout
			fill-height=""
			align-center=""
			justify-center=""
			v-if="loading.fail"
		>
			<v-btn @click="loadDetails(id)" depressed="">
				<v-icon left dense="">fa-redo</v-icon>
				<span class="">{{ $t("retry") }}</span>
			</v-btn>
		</v-layout> -->
	</v-layout>
</template>

<script>
export default {
	components: {},
	computed: {
		id() {
			return this.$route.params.map_gid;
		},
		windowWidth() {
			return this.$store.state.windowWidth;
		}
	},
	watch: {
		id(val) {
			if (!val) return;
			this.loadDetails(val);
			this.loadEvents(val);
		},
		windowWidth(val) {
			this.navWidth = val / this.surrounding.length + "px !important";
		},
		el: {
			handler(val) {
				if (val.audio) {
					val.audio.addEventListener("play", this.audioPlay);
				}
				if (val.video) {
					val.video.addEventListener("play", this.videoPlay);
				}
			},
			deep: true
		},
		details: {
			handler(val) {
				if (this.panorama.length === 0 && val.map_polygon_details_panorama) {
					this.panorama = val.map_polygon_details_panorama.split(",");
					// this.panorama = [
					// 	require("../assets/b523e48b9a08fe7e2847182bd9ac1e2c.jpg")
					// ];
				}

				if (this.images.length === 0 && val.map_polygon_details_images) {
					this.images = val.map_polygon_details_images.split(",");
				}
			},
			deep: true
		}
	},
	mounted() {
		this.loadDetails(this.id);
		this.loadEvents(this.id);
	},
	beforeDestroy() {
		this.details = {};
		if (this.el.audio) {
			this.el.audio.removeEventListener("play", this.audioPlay);
		}
		if (this.el.video) {
			this.el.video.removeEventListener("play", this.videoPlay);
		}
		this.el = {};
	},
	data() {
		return {
			panoramaView: {},
			windowHeight: window.innerHeight,
			hfov: 90,
			yaw: -90,
			pitch: 0,
			navWidth: "",
			loading: {
				content: true,
				fail: false,
				voice: false
			},
			showPanorama: "",
			panorama: [],
			panoramaFullScreen: false,
			voiceSource: "",
			voice: "",
			voicePlaying: false,
			voiceIcon: "fa-headphones",
			details: {},
			images: [],
			events: [],
			address: "",
			el: {
				audio: "",
				video: ""
			},
			surrounding: [
				{
					text: "food",
					icon: "fa-utensils"
				},
				{
					text: "shopping",
					icon: "fa-shopping-cart"
				},
				{
					text: "hotel",
					icon: "fa-hotel"
				},
				{
					text: "parking",
					icon: "fa-parking"
				},
				{
					text: "bus",
					icon: "fa-bus"
				},
				{
					text: "toilet",
					icon: "fa-restroom"
				}
			]
		};
	},
	methods: {
		audioPlay() {
			if (this.el.video) this.el.video.pause();
		},
		videoPlay() {
			if (this.el.audio) this.el.audio.pause();
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
				if (r) {
					_this.details = r;
					const addressStore = _this.$store.state.db
						.transaction("mapPolygonAddress")
						.objectStore("mapPolygonAddress")
						.get(id);
					addressStore.onsuccess = function(a) {
						const add = a.target.result;
						if (add) {
							_this.address = add;
						}
					};
					if (!r.map_polygon_details_content) {
						_this.loadDescription(id);
					} else {
						_this.loading.content = false;
					}
					_this.$previewRefresh();
					setTimeout(function() {
						_this.el.audio = document.getElementById("audioIntro");
						_this.el.video = document.getElementById("videoIntro");
					}, 500);
				} else {
					_this.loading.fail = true;
				}
			};
			readStore.onerror = function() {
				_this.loading.fail = true;
			};
		},
		loadEvents(id) {
			const _this = this;
			const readStore = _this.$store.state.db
				.transaction("events")
				.objectStore("events")
				.get(id);
			const titleTag =
				_this.$i18n.locale === "zh_CN"
					? "project_events_theme"
					: "project_events_theme_en";
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				const nowTime = new Date().getTime();
				if (r && r.timestamp > nowTime && r.val.length > 0) {
					for (let i = 0; i < r.val.length; i++) {
						const e = r.val[i];
						e.title = e[titleTag];
						_this.events.push(e);
					}
				} else {
					_this.$http
						.get(_this.apiHost + "/project/events", {
							params: {
								mapGid: id,
								projectID: _this.$store.state.startPointInfo.project_id,
								timestamp: parseInt(new Date().getTime() / 1000)
							}
						})
						.then(function(resp) {
							if (resp.status === 200) {
								const timestamp = new Date().getTime() + 300 * 1000;
								const writeStore = _this.$store.state.db
									.transaction("events", "readwrite")
									.objectStore("events");
								writeStore.put({
									map_gid: id,
									timestamp: timestamp,
									val: resp.body
								});

								for (let i = 0; i < resp.body.length; i++) {
									const e = resp.body[i];
									e.title = e[titleTag];
									_this.events.push(e);
								}
							}
						});
				}
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
							const writePolygonStore = _this.$store.state.db
								.transaction("mapPolygons", "readwrite")
								.objectStore("mapPolygons");
							writePolygonStore.put(_this.details);
						}
						_this.loading.content = false;
					},
					function() {
						_this.loading.content = false;
					}
				);
		},
		route(item) {
			const _item = item;
			_item.lnglat = this.changePoint(item.point);
			this.$store.commit("updateCurrentRoute", item);
			this.$router.replace("/route");
		},
		searchSurrounding(item) {
			const details = this.details;
			details.keywords = item.text;
			details.icon = item.icon;
			this.$store.commit("updateSurrounding", details);
			this.$router.replace("/attractionSurrounding");
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
	max-height: 200px !important;
}
</style>
<style scoped>
.v-item-group.v-bottom-navigation .v-btn {
	min-width: 30px;
}
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

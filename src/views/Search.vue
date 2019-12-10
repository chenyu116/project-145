<template>
	<v-container fluid="" class="mt-12">
		<HeaderWithBack title="search" icon="fa-search"></HeaderWithBack>
		<v-row dense="" class="mt-2">
			<v-col cols="1" v-if="canUseSpeech" class="text-center"
				><v-btn
					:disabled="loading.searching"
					color="lime darken-1"
					@click="speechMode = !speechMode"
					icon=""
					><v-icon>{{
						speechMode ? "fa-microphone-alt-slash" : "fa-microphone-alt"
					}}</v-icon></v-btn
				></v-col
			>
			<v-col :cols="canUseSpeech ? 8 : 9">
				<v-text-field
					v-model="keywords"
					outlined=""
					color="lime darken-1"
					:label="$t('keywords')"
					dense=""
					clearable=""
					:error-messages="errMsg"
					:loading="loading.searching"
					:disabled="loading.searching"
					@focus="speechMode = false"
				></v-text-field>
			</v-col>
			<v-col cols="3"
				><v-btn
					:disabled="loading.searching"
					color="lime darken-1"
					@click="search"
					block=""
				>
					{{ $t("search") }}
				</v-btn></v-col
			></v-row
		>
		<v-row v-if="!speechMode">
			<v-col cols="12" v-if="list.length === 0 && polygons.length > 0">
				<v-card-title>{{ $t("attractions") }}</v-card-title>
				<v-chip
					v-for="(item, index) in polygons"
					:key="index"
					outlined=""
					:to="`/details/${item.map_gid}`"
					replace=""
					class="mt-2 ml-2"
					>{{ $t(item.name) }}</v-chip
				>
			</v-col>
			<v-col cols="12" v-if="list.length > 0">
				<v-list
					three-line=""
					:height="$store.state.windowHeight - 190"
					class="overflow-y-auto"
					:width="$store.state.windowWidth - 25"
				>
					<template v-for="(item, index) in list">
						<v-divider :key="`divider-${index}`" v-if="index > 0"></v-divider>
						<v-list-item :key="index">
							<v-list-item-content>
								<v-list-item-title>{{ item.name }}</v-list-item-title>
								<v-list-item-subtitle>{{ item.address }}</v-list-item-subtitle>
							</v-list-item-content>
							<v-list-item-action @click="route(item)"
								><v-btn icon="">
									<v-icon color="lime darken-1">fa-location-arrow</v-icon>
								</v-btn>
								<v-list-item-action-text
									>{{ item.distance }}
									{{ $t("meter") }}</v-list-item-action-text
								></v-list-item-action
							>
							<!-- <v-list-item-action class="subtitle-2">{{
									item.address
								}}</v-list-item-action> -->
						</v-list-item>
					</template>
				</v-list></v-col
			>
		</v-row>

		<v-row no-gutters="" v-if="speechMode && !loading.searching">
			<v-col cols="12" class="text-center">
				<v-card flat="" :height="$store.state.windowHeight - 260">
					<v-layout align-end="" justify-center="" fill-height="">
						<v-row>
							<v-col cols="12" class="text-center mb-10"
								><v-icon x-large="">{{
									isRecording ? "fa-circle-notch fa-spin" : "fa-microphone-alt"
								}}</v-icon></v-col
							>
							<v-col cols="12">
								<v-btn
									class="mx-2"
									fab
									dark
									x-large
									color="pink"
									@touchstart="startRecord"
									@touchend="stopRecord"
								>
									<v-icon dark>fa-fingerprint</v-icon>
								</v-btn>
							</v-col>
							<v-col cols="12">{{ $t("holdDownAndTalk") }}</v-col>
						</v-row>
					</v-layout>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			loading: {
				searching: false
			},
			errMsg: "",
			keywords: "",
			list: [],
			polygons: [],
			currentPosition: "",
			listHeight: window.innerHeight - 200,
			canUseSpeech: false,
			speechMode: false,
			startRecordTime: 0,
			endRecordTime: 0,
			recordTime: 0,
			isRecording: false,
			recordTimeout: null,
			speechRowStyle: "",
			speechLocalId: ""
		};
	},
	computed: {
		windowHeight() {
			return this.$store.state.windowHeight;
		}
	},
	watch: {
		windowHeight: {
			handler(val) {
				this.speechRowStyle = "height:" + (val - 270) + "px;";
			},
			immediate: true
		},
		speechLocalId(val) {
			if (!val) return;
			const _this = this;
			this.$wechat.wx.translateVoice({
				localId: val, // 需要识别的音频的本地Id，由录音相关接口获得
				isShowProgressTips: 1, // 默认为1，显示进度提示
				success: function(res) {
					_this.keywords = res.translateResult
						? res.translateResult.replace("。", "")
						: ""; // 语音识别的结果
					_this.speechLocalId = "";
					_this.search();
				}
			});
		}
	},
	created() {
		const _this = this;
		if (this.$store.state.isWx) {
			this.$wechat.wx.ready(function() {
				_this.canUseSpeech = true;
			});
		}

		this.loadPolygons();
		if (this.$store.state.searchKeywords) {
			this.keywords = this.$store.state.searchKeywords;
			this.search();
		}
	},
	beforeDestroy() {
		if (this.$route.name !== "route") {
			this.$store.commit("updateSearchKeywords", null);
		}
	},
	methods: {
		search() {
			const _this = this;
			this.keywords = this.keywords ? this.keywords.trim() : "";
			if (this.keywords === "") {
				this.errMsg = this.$t("needKeywords");
				return;
			}
			this.$http.put(
				this.apiHost + "/project/spm",
				{
					type: "search",
					content: JSON.stringify({
						keywords: _this.keywords,
						locale: _this.$i18n.locale,
						agent: _this.$store.state.navigator.userAgent
					}),
					contentType: "json",
					tag: _this.$store.state.userId,
					projectID: _this.$store.state.startPointInfo.project_id,
					timestamp: parseInt(new Date().getTime() / 1000)
				},
				{
					emulateJSON: false
				}
			);
			this.$store.commit("updateSearchKeywords", this.keywords);
			this.errMsg = "";
			this.loading.searching = true;
			const searchLang = this.$i18n.locale === "zh_CN" ? "zh_CN" : "en";
			const placeSearch = new window.AMap.PlaceSearch({
				pageSize: 20,
				lang: searchLang
			});
			let currentPoint = this.changePoint(
				this.$store.state.startPointInfo.point
			);
			try {
				window.AMap.plugin("AMap.Geolocation", function() {
					const geolocation = new window.AMap.Geolocation();
					geolocation.getCurrentPosition(function(status, result) {
						if (result.position) {
							currentPoint = [result.position.lng, result.position.lat];
						}
						placeSearch.searchNearBy(
							_this.keywords,
							currentPoint,
							5000,
							function(status, result) {
								if (
									result.info === "OK" &&
									result.poiList &&
									result.poiList.pois.length > 0
								) {
									_this.list = result.poiList.pois;
									_this.speechMode = false;
								} else {
									_this.errMsg = _this.$t("noSearchResult");
								}
								_this.loading.searching = false;
							}
						);
					});
				});
			} catch (e) {
				_this.errMsg = _this.$t("anErrorOccurred");
				_this.loading.searching = false;
			}
		},
		loadPolygons() {
			const _this = this;
			const readStore = _this.$store.state.db
				.transaction("mapPolygons")
				.objectStore("mapPolygons")
				.getAll();
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				if (r && r.length > 0) {
					_this.polygons = r;
				}
			};
		},
		startRecord(e) {
			const _this = this;
			e.preventDefault();
			this.startRecordTime = new Date().getTime();
			this.recordTimeout = setTimeout(function() {
				console.log("startRecord");
				clearTimeout(this.recordTimeout);
				_this.isRecording = true;
				_this.$wechat.wx.startRecord();
			}, 200);
		},
		stopRecord() {
			const _this = this;
			this.isRecording = false;
			this.recordTime = new Date().getTime() - this.startRecordTime;
			console.log(this.recordTime);
			if (this.recordTime <= 200) {
				clearTimeout(this.recordTimeout);
				return;
			}
			this.$wechat.wx.stopRecord({
				success: function(res) {
					_this.speechLocalId = res.localId;
				},
				fail: function() {}
			});
		},
		route(item) {
			const details = item;
			details.lnglat = [item.location.lng, item.location.lat];
			this.$store.commit("updateCurrentRoute", details);
			this.$router.replace("/route");
		}
	}
};
</script>

<template>
	<v-app-bar color="lime darken-1" fixed="" elevation="2" tile="">
		<v-toolbar-title class="subtitle-1"
			><v-icon left="" dense="">{{ icon }}</v-icon
			>{{ $t(title) }}</v-toolbar-title
		>
		<v-spacer></v-spacer>
		<v-btn
			color="grey darken-2"
			class="white--text subtitle-2"
			@click="goBack"
			small=""
			elevation="1"
		>
			<v-icon left dense="">fa-angle-left</v-icon>
			{{ $t("back") }}
		</v-btn>
		<v-dialog
			fullscreen=""
			persistent
			v-model="loading.back"
			:transition="false"
		>
			<v-layout
				justify-center
				align-center
				fill-height
				style="background-color: rgba(255, 255, 255, .8);"
			>
				<v-progress-circular indeterminate color="lime" :size="70" :width="7">
				</v-progress-circular>
			</v-layout>
		</v-dialog>
	</v-app-bar>
</template>

<script>
export default {
	props: {
		title: {
			type: String,
			required: true
		},
		icon: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			loading: {
				back: false
			}
		};
	},
	methods: {
		goBack() {
			const _this = this;
			this.loading.back = true;
			setTimeout(function() {
				_this.$store.dispatch("getBackPath").then(function(resp) {
					_this.$store.commit("updateIsBack", true);
					_this.$router.replace(resp);
				});
			}, 500);
		}
	}
};
</script>

<template>
	<v-dialog v-model="show" persistent :max-width="390" :dark="false">
		<v-card>
			<v-card-title class="title">{{ title }}？</v-card-title>
			<v-card-text>{{ text }}</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="red darken-1" dark="" @click="confirm">确定</v-btn>
				<v-btn text @click="hide(true)">取消</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	data() {
		return {
			show: true,
			title: "",
			text: "",
			data: null,
			callback: function() {},
			cancel: function() {}
		};
	},
	methods: {
		confirm() {
			this.hide(false);
			this.callback(this.data);
		},
		hide(cancel) {
			this.show = false;
			this.$confirm.hide();
			if (cancel) this.cancel();
		}
	}
};
</script>

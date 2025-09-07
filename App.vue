<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	@import '//cdn.jsdelivr.net/npm/mana-font@latest/css/mana.min.css';

	.sr-only {
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		position: absolute;
		overflow: hidden;
	}
</style>
<template>
    <div v-if="isShow">
        <span v-if="this.innerMessage">
            {{this.innerMessage}}
        </span>
        <span v-if="this.innerSearch">
            Результаты поиска по запросу: '{{this.innerSearch}}'
        </span>
        <b-spinner label="Spinning" type="grow" variant="primary"
                   v-if="items.length === 0 && $router.history.getCurrentLocation().includes('/recommend') && !innerMessage" />
        <ul id="item-container">
            <li :key="i.id" v-for="i in items">
                <itemComponent :item="i" @openItem="openItem" @popUp="popUp" @fut="fut" @rat="rat"/>
            </li>
        </ul>
    </div>
</template>

<script>
    // TODO : insert popUp
    import itemComponent from '@/components/movie/ItemComponent';
	export default {
		name: "ItemContainer",
        props: ['render', 'items', 'searchData', 'message'],
        components: {
            itemComponent
        },
		data() {
			return {
                selectedId: '',
                isShow: true,
                innerItems: this.items,
                innerMessage: this.message,
                innerSearch: this.searchData,
				fetchError: this.fetchError
			}
		},
        watch: {
            render: function() {
                this.isShow = this.render;
            },
            items: function() {
                console.log('CONTAINER ITEM CHANGED')
                console.log(this.items)
                this.innerItems = this.items;
            },
            searchData: function() {
                this.innerSearch = this.searchData();
            },
            message: function() {
                this.innerMessage = this.message;
            }
        },
        methods: {
            openItem(id) {
                this.$emit('openItem', id);
            },
            popUp() {
                console.log('Insert PopUp');
            },
            fut(itemType, id) {
                this.$emit('fut', itemType, id, true);
            },
            rat(itemType, id, newRate, oldRate) {
                this.$emit('rat', itemType, id, newRate, oldRate);
            }
        },
        mounted() {
            console.log("CONTAINER MOUNTED");
            console.log(this.items);
        },
        updated() {
            console.log("CONTAINER UPDATED");
            console.log(this.items);
        },

	}
</script>

<style scoped>

</style>

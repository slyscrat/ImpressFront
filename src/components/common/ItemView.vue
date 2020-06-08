<template>
    <div>
        <a
                style="color: blue; cursor: pointer;"
                onmouseover="this.style.color='red'"
                onmouseout="this.style.color='blue'"
                @click="back"
        >
            Назад
        </a>
        <div>

        </div>
    </div>
</template>

<script>
    // TODO : also call popUp
    // TODO : change rate and futured in itemContainer by passing to Movie.vue new item and search by id
    export default {
        name: "ItemView",
        data() {
            return {
                item: {},
                itemId: this.$route.params.id,
                itemType: "",
            }
        },
        methods: {
            back() {
                /*this.$emit('back');*/
                this.$router.go(-1);
            }
        },
        mounted() {
            let location = this.$router.history.getCurrentLocation();
            this.itemType = location.includes('movie') ? 'movie' :
                location.includes('game') ? 'game' :
                    location.includes('book') ? 'book' : '';

        }
    }
</script>

<style scoped>

</style>
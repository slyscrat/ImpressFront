<template>
    <div>
        <div class="myCard" :item="item" >
            <img :src="this.source + item.icon" class="clickable" :class="this.itemType" @click="openItem"/>
            <!--<img :src="images.rabbit" class="clickable" :class="this.itemType" @click="openItem"/>-->
            <div>
                <img :src="images.mark" class="smallImg" @click="future"
                     :class="{ forFuture: this.rating === 0,
                     notForFuture: this.rating !== 0,
                     clickable: this.$store.getters['security/token'].length > 0}" />
                <span @click="rate">
                    <starRating :star-size="25" v-model="rating" :show-rating="false"
                                :read-only="this.$store.getters['security/token'].length === 0"/>
                </span>
            </div>
            <span class="clickable myText" @click="openItem">{{item.name}}</span>
            <!--<span class="clickable myText" @click="openItem">{{this.innerItem.name}}</span>-->
            <!-- change text to Гарри Поттер и философский камень -->
        </div>
    </div>
</template>

<script>
    import {SMALL_MOVIE_IMG} from "@/utils/constants"
    import starRating from "vue-star-rating";

    export default {
        name: "ItemComponent",
        props: ['item'],
        components: {
            starRating
        },
        data() {
            return {
                source: "",
                itemType: "",
                rating: this.item.rate,
                oldRating: -1,
                images: {
                    mark: require('@/assets/static/0_bookmark.png'),
                    book: require('@/assets/static/0_book.png')
                }
            }
        },
        mounted() {
            console.log("ITEM MOUNTED");
            this.source = '';
            let type = this.$router.history.getCurrentLocation();
            type = type.substring(1);
            this.itemType = type.substring(0, type.indexOf('/'));
            if (this.itemType === 'movie') this.source = SMALL_MOVIE_IMG;
            if (this.itemType === 'book' && this.item.icon.includes('cdn')) this.item.icon = this.images.book;
            this.oldRating = this.item.rate;
        },
        methods: {
            future() {
                if (!this.authorityCheck()) return false;
                if (this.rating > 0) return false;
                this.$emit('fut', this.itemType, this.item.id);
            },
            openItem() {
                this.$emit('openItem', this.item.id);
            },
            rate() {
                if (!this.authorityCheck()) return false;
                if (this.rating > 5 || this.rating < 0) return false;
                console.log("ITEM RATE " + this.rating);
                this.$emit('rat', this.itemType, this.item.id, this.rating, this.oldRating);
            },
            authorityCheck() {
                return this.$store.getters['security/token'].length > 0;
            }
        },
        /*watch: {
            item: function() {
                console.log("ITEM CHANGED");
                this.source = '';
                let type = this.$router.history.getCurrentLocation();
                type = type.substring(1);
                this.itemType = type.substring(0, type.indexOf('/'));
                if (this.itemType === 'movie') this.source = SMALL_MOVIE_IMG;
                if (this.itemType === 'book' && this.item.icon.includes('cdn')) this.item.icon = this.images.book;
                this.rating = this.item.rate;
                this.oldRating = this.rating;
            },
        },*/
        updated() {
            console.log("ITEM UPDATED");
        }
    }
</script>

<style scoped>
    .movie, .book {
        width: 220px;
        height: 320px;
        border-radius: 10px;
    }

    .smallImg {
        width: 7%
    }

    .forFuture {
        opacity: 1;
    }

    .notForFuture {
        opacity: 0.5;
    }

    .myText {
        text-align: center;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .clickable {
        cursor: pointer;
    }

    .myCard {
        width: 220px;
        height: 430px;
    }
</style>
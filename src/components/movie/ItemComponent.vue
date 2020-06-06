<template>
    <div>
        <div class="myCard" v-if="show">
            <!--<img :src="this.source + this.innerItem.icon" class="clickable" :class="this.itemType"/>-->
            <img :src="images.rabbit" class="clickable" :class="this.itemType" @click="openItem"/>
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
            <span class="clickable myText" @click="openItem">Гарри Поттер и философский камень</span>
            <!--<span class="clickable myText" @click="openItem">{{this.innerItem.name}}</span>-->
        </div>
    </div>
</template>

<script>
    import {API_SERVER_PATH, SMALL_MOVIE_IMG} from "@/utils/constants"
    import starRating from "vue-star-rating";
    import axios from "axios";

    export default {
        name: "ItemComponent",
        props: ['item', 'type'],
        components: {
            starRating
        },
        data() {
            return {
                show: false,
                source: "",
                itemType: "",
                rating: "",
                innerItem: {},
                oldRating: -1,
                images: {
                    mark: require('@/assets/static/0_bookmark.png'),
                    rabbit: require('@/assets/static/rabbit.jpg'),
                }
            }
        },
        watch: {
            type: function() {
                this.source = '';
                this.itemType = '';
                let itemT = this.type.substring(1);
                this.itemType = itemT.substring(0, itemT.indexOf('/'));
                if (this.itemType === 'movie') {
                    this.source = SMALL_MOVIE_IMG;
                }
                console.log(this.itemType);
            },
            item: function() {
                this.innerItem = this.item;
                this.show = true;
            },
            innerItem: function() {
                this.oldRating = this.innerItem.rate;
                this.rating = this.innerItem.rate;
            }
        },
        methods: {
            future() {
                if (!this.authorityCheck()) return false;
                axios.post(API_SERVER_PATH + '/${this.itemType}/{this.item.id}/rate', 0, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then((response) => {
                    if (this.oldRating >= 0 && response.data.rating === 0) this.$emit('popUp');
                    this.innerItem = response.data;
                }).catch((error) => {
                    console.log(error);
                });
            },
            openItem() {
                this.$emit('openItem', this.item.id);
            },
            rate() {
                if (!this.authorityCheck()) return false;
                axios.post(API_SERVER_PATH + '/${this.itemType}/{this.item.id}/rate', this.rating, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then((response) => {
                    if (this.oldRating >= 0 && response.data.rate === 0)
                        this.$emit('popUp');
                    this.innerItem = response.data;
                }).catch((error) => {
                    console.log(error);
                });
            },
            authorityCheck() {
                return this.$store.getters['security/token'].length > 0;
            }
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
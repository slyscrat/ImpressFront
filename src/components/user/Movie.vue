<template>
    <div class="items-container">
        <b-navbar toggleable="sm" type="dark" variant="dark">
            <img :src="images.logo" style="cursor:pointer" @click="$router.push('/movie/list')"/>

            <b-navbar-nav class="notes" fill>
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute == '/movie/list' || rootRoute == '/movie'}"
                            to="/movie/list"
                            ref = "/movie/list"
                            @click="changeRoute"
                >
                    Фильмы
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute == '/game/list'}"
                            to="/game/list"
                            ref = "/game/list"
                            @click="changeRoute"
                >
                    Игры
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute == '/book/list'}"
                            to="/book/list"
                            ref = "/book/list"
                            @click="changeRoute"
                >
                    Книги
                </b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav>
                <form class="form-inline" v-on:keydown.enter.prevent="search">
                    <input class="form-control mr-sm-2" type="text" placeholder="Поиск" v-model="searchData">
                    <b-button @click="search" class="text-hide">
                        <img :src="images.search"/>
                    </b-button>
                </form>
            </b-navbar-nav>
            <b-navbar-nav class="fixedSize">
                <div v-if="!this.$store.getters['security/id']">
                    <b-button v-b-modal.loginModal class="my-button" ref="authBtn">
                        Войти
                    </b-button>
                    <b-button v-b-modal.registrationModal class="link" ref="regBtn">
                        Регистрация
                    </b-button>
                </div>
                <b-nav-item-dropdown v-else-if="this.$store.getters['security/id']" right>
                    <template v-slot:button-content>
                        {{user.nickName}}
                        <img :src="images.user" width="15%">
                    </template>
                    <b-dropdown-item disabled>
                        {{user.name}}
                    </b-dropdown-item>
                    <b-dropdown-item disabled>
                        {{user.email}}
                    </b-dropdown-item>
                    <b-dropdown-item @click="sendLogout">Выйти</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>

        </b-navbar>
        <b-navbar type="dark" variant="dark" class="lowerNavbar">
            <b-navbar-nav class="notes" fill>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute"
                >
                    Все
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/futured'"
                >
                    Отложенные
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/rated'"
                            @click="changeSelected"
                >
                    Оцененные
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/recommended'"
                            @click="changeSelected"
                >
                    Рекомендованные
                </b-nav-item>
            </b-navbar-nav>
        </b-navbar>
        <sortingComponent :type="this.rootRoute" @search="sort"/>
        <b-button @click="test">Тест</b-button>
        <itemComponent :type="this.rootRoute" :item="this.items[0]" @openItem="itemInfo" @popUp="popUp"/>
        <router-view>
        </router-view>
        <loginModal @register="registration" @auth="reload"/>
        <registrationModal @auth="authorization"/>
    </div>
</template>

<script>
	import {mapMutations} from "vuex";
	import {LOGOUT} from "@/store/modules/security";
	import axios from "axios";
    import loginModal from '@/components/common/LoginModal';
    import sortingComponent from '@/components/common/SortingComponent';
    import itemComponent from '@/components/movie/ItemComponent';
    import registrationModal from '@/components/common/RegistrationModal';
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "MainPage",
        components: {
            loginModal,
            registrationModal,
            sortingComponent,
            itemComponent
        },
		data() {
			return {
                rootRoute: "",
                searchData: "",
				user: {},
                page: 0,
                itemToShow: null,
                showModal: false,
                images: {
                    logo: require('@/assets/static/0_log.png'),
                    search: require('@/assets/static/0_searc.png'),
                    user: require('@/assets/static/0_user.png')
                },
				fetchError: '',
                items: []
			}
		},
		methods: {
			...mapMutations('security', {
				logout: LOGOUT
			}),
            itemInfo(item) {
                let route = this.rootRoute;
                route = route.substring(1);
                this.$router.push('/' + route.substring(0, route.indexOf('/') + 1) + item);
            },
            authorization() {
                this.$refs.authBtn.click();
            },
            popUp() {
                console.log("Pop up CALLED");
            },
            registration() {
                this.$refs.regBtn.click();
            },
            test() {
                var object = {
                    description : "Продолжение истории маленького и непоседливого кролика по имени Питер. Беатрис, Томас и крольчата, наконец, находят общий язык и начинают спокойную и размеренную жизнь за городом. Однако Питеру это совсем не по нраву: его мятежная душа требует приключений, и он отправляется на их поиски в большой город, туда, где его проделки уж точно оценят по достоинству. Тем временем, члены его большой дружной семьи, рискуя жизнью, отправляются вслед за Питером, чтобы вернуть его домой, и теперь беглецу предстоит решить, что же для него важнее всего.",
                    duration : 0,
                    futured : false,
                    icon : "/rabbit.jpg",
                    id : 522478,
                    name : "Кролик Питер 2",
                    rate : 0
                };
                this.items.push(object);
            },
            sort(sortValue, genresValues) {
                let genres = "";
                genresValues.forEach((genre) => genres += (genre + ","));
                genres = genres.substring(0, genres.length - 1);
                axios.get(API_SERVER_PATH + this.rootRoute, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                    params: {
                        p: this.page,
                        s: sortValue,
                        g: genres
                    }
                }).then((response) => {
                    this.items = response.data;
                }).catch((error) => {
                    console.log(error);
                });
            },
            sendLogout() {
                axios.post(API_SERVER_PATH + "/auth/logout", null, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then(() => {
                    this.logout();
                    this.user = {};
                }).catch((error) => {
                    console.log(error);
                });
            },
            changeRoute() {
                this.rootRoute = this.$router.history.getCurrentLocation();
            },
            changeSelected() {
                (this.$refs[this.rootRoute]).childNodes[0].addClass('active');
            },
            sendLogin() {
                axios.get(API_SERVER_PATH + `/user/${this.$store.getters['security/id']}`, {
                        headers: {
                            'Authorization': 'Bearer ' + this.$store.getters['security/token']
                        }
                    }).then((response) => {
                        this.fetchError = '';
                        this.user = Object.assign({}, this.user, response.data);
                    }).catch((error) => {
                        if (error.response) {
                            this.fetchError = error.response.data;
                        } else if (error.request) {
                            this.fetchError = "Сервер не отвечает";
                        }
                    })
            },
            reload() {
                if (this.$store.getters['security/oldId'] != this.$store.getters['security/id']) this.$forceUpdate();
            },
            search() {
                if (this.searchData.length == 0) return false;
                axios.get(API_SERVER_PATH + this.rootRoute + '/search', {
                    params: {
                        q: this.searchData,
                        p: this.page
                    },
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    }
                }).then((response) => {
                    // add search info in page
                    this.searchData = "";
                    this.items = response.data;
                }).catch((error) => {
                    if (error.response) {
                        this.fetchError = error.response.data;
                    } else if (error.request) {
                        this.fetchError = "Сервер не отвечает";
                    }
                })
            }
		},
		mounted() {
            this.changeRoute();
            if (this.$store.getters['security/id']) {
                this.sendLogin();
            }
		},
        updated() {
            if (this.$store.getters['security/id'] && this.$store.getters['security/id'] != this.user.id) {
                this.sendLogin();
            }
        }
	}
</script>

<style scoped>
    .test {
        background-color: yellow;
    }

    .items-container {
        background-color: whitesmoke; /*#38444c;*/
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    .navbar-nav > li {
        float: left;
        position: relative;
    }

    input[type="text"],
    select.form-control {
        background: transparent;
        border: none;
        border-bottom: 1px solid;
        -webkit-box-shadow: none;
        box-shadow: none;
        border-radius: 0;
    }

    input[type="text"]:focus,
    select.form-control:focus {
        -webkit-box-shadow: none;
        box-shadow: none;
        color: red;
    }

    .navbar-nav .active::after {
        border-bottom: 5px solid #eadcc7;
        bottom: -10px;
        content: " ";
        left: 0;
        position: absolute;
        right: 0;
    }

    .navbar {
        display: flex;
        flex-direction: row;
        align-content: space-between;
        justify-content: space-around;
    }

    .lowerNavbar {
        opacity: 65%;
    }

    .notes {
        display: flex;
        width: 50%;
        flex-direction: row;
        justify-content: space-between;
    }

    .fixedSize {
        width: 20%;
        background-color: green;
    }


    .fixed-size::after {
        display: none;
        content: none;
    }
</style>

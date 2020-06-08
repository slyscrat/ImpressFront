<template>
    <div class="items-container">
        <b-navbar toggleable="sm" type="dark" variant="dark">
            <img :src="images.logo" style="cursor:pointer" @click="$router.push('/movie/list')"/>

            <b-navbar-nav class="notes" fill>
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute.includes('movie')}"
                            to="/movie/list"
                            ref = "/movie/list"
                            @click="changeRoute(); changeState();"
                >
                    Фильмы
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute.includes('game')}"
                            to="/game/list"
                            ref = "/game/list"
                            @click="changeRoute(); changeState();"
                >
                    Игры
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            v-bind:class="{active: rootRoute.includes('book')}"
                            to="/book/list"
                            ref = "/book/list"
                            @click="changeRoute(); changeState();"
                >
                    Книги
                </b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav>
                <form class="form-inline" v-on:keydown.enter.prevent="search">
                    <input class="form-control mr-sm-2" type="search" placeholder="Поиск" v-model="searchData">
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
                            @click="changeState"
                >
                    Все
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/futured'"
                            @click="changeState"
                >
                    Отложенные
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/rated'"
                            @click="changeState"
                >
                    Оцененные
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            :to= "this.rootRoute + '/recommended'"
                            @click="changeState"
                >
                    Рекомендованные
                </b-nav-item>
            </b-navbar-nav>
        </b-navbar>
        <sortingComponent :key="cleanInputs" :render="this.isList" :type="this.rootRoute" @search="sort"/>
        <!--<b-button @click="test">Тест</b-button>-->
        <!-- Create popUp inside this container -->
        <itemContainer :render="this.isList" :items="this.items" :searchData="this.searchData" @openItem="itemInfo" />
        <div>
            <img :src="images.left" @click="move(false)"
                 :class="{unactiveImg: this.page < 2, activeImg: this.page > 1}"
                 style="width:1.8%"/>
            <span>
                Страница {{this.page}}
            </span>
            <img :src="images.right" @click="move(true)"
                 :class="{unactiveImg: this.items.length < 20, activeImg: this.items.length === 20}"
                 style="width:1.8%"/>
        </div>
        <div toggleable="sm" type="dark" variant="dark" class="myFooter">
            2020 Дипломная работа Бутышкиса Ильи
        </div>

        <!--<itemComponent :type="this.rootRoute" :item="this.items[0]" @openItem="itemInfo" @popUp="popUp"/>-->
        <router-view>
        </router-view>
        <loginModal @register="registration" @auth="reload"/>
        <registrationModal @auth="authorization"/>
    </div>
</template>

<script>
    // TODO : remove test method
	import {mapMutations} from "vuex";
	import {LOGOUT} from "@/store/modules/security";
	import axios from "axios";
    import loginModal from '@/components/common/LoginModal';
    import sortingComponent from '@/components/common/SortingComponent';
    /*import itemComponent from '@/components/movie/ItemComponent';*/
    import itemContainer from '@/components/movie/ItemContainer';
    import registrationModal from '@/components/common/RegistrationModal';
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "MainPage",
        components: {
            loginModal,
            registrationModal,
            sortingComponent,
            /*itemComponent,*/
            itemContainer
        },
		data() {
			return {
                oldPath: "",
                cleanInputs: 0,
                rootRoute: "",
                searchData: "",
				user: {},
                isList: "",
                page: 1,
                itemToShow: null,
                showModal: false,
                images: {
                    logo: require('@/assets/static/0_log.png'),
                    search: require('@/assets/static/0_searc.png'),
                    user: require('@/assets/static/0_user.png'),
                    left: require('@/assets/static/0_left.png'),
                    right: require('@/assets/static/0_right.png'),
                },
				fetchError: '',
                items: []
			}
		},
        watch: {
            page: function() {
                console.log('Page changed');
            }
        },
		methods: {
			...mapMutations('security', {
				logout: LOGOUT
			}),
            itemInfo(id) {
                this.isList = false;
                let route = this.rootRoute;
                route = route.substring(1);
                this.$router.push('/' + route.substring(0, route.indexOf('/') + 1) + id);
                //this.path = this.$router.history.getCurrrentLocation();
                //console.log(this.path);
            },
            authorization() {
                this.$refs.authBtn.click();
            },
            registration() {
                this.$refs.regBtn.click();
            },
            move(forward) {
                // check page not overloaded
                // check current page + send responsive method = fetchData()
                if (forward && this.items.length === 20) this.page++;
                else if (!forward && this.page > 1) this.page--;
                else return false;
            },
            /*
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
            },*/
            sort(sortValue, genresValues) {
                this.searchData = "";
                let genres = "";
                genresValues.forEach((genre) => genres += (genre + ","));
                genres = genres.substring(0, genres.length - 1);
                axios.get(API_SERVER_PATH + this.rootRoute, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                    params: {
                        p: this.page - 1,
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
            fetchData() {
                console.log('FETCHING');
            },
            changeRoute() {
                console.log("routeChanged");
                let route = this.$router.history.getCurrentLocation().substring(1);
                route = route.substring(0, route.indexOf('/'));
                this.rootRoute = '/'+ route + '/list';
                this.fetchData();
            },
            changeState() {
                this.page = 1;
                this.cleanInputs++;
                this.searchData = "";
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
                this.$router.push(this.rootRoute + '/search');
                this.cleanInputs++;
                axios.get(API_SERVER_PATH + this.rootRoute + '/search', {
                    params: {
                        q: this.searchData,
                        p: this.page - 1
                    },
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    }
                }).then((response) => {
                    this.items = response.data;
                    console.log(response.data);
                }).catch((error) => {
                    if (error.response) {
                        this.fetchError = error.response.data;
                        console.log('');
                    } else if (error.request) {
                        this.fetchError = "Сервер не отвечает";
                    }
                })
            }
		},
		mounted() {
            console.log('mounted');
            this.isList = true;
            this.changeRoute();
            if (this.$store.getters['security/id']) {
                this.sendLogin();
            }
		},
        updated() {
            console.log('updated');
            if (this.$router.history.getCurrentLocation().includes('list')) this.isList = true;
            if (this.$store.getters['security/id'] && this.$store.getters['security/id'] != this.user.id) this.sendLogin();
            if (this.oldPath !== this.$router.history.getCurrentLocation()) {
                this.oldPath = this.$router.history.getCurrentLocation();
                this.fetchData();
            }
        }
	}
</script>

<style scoped>
    .test {
        background-color: yellow;
    }

    .activeImg {
        opacity: 1;
        cursor: pointer;
    }

    .unactiveImg {
        opacity: 0.5;
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

    /* TODO */
    .myFooter {
        color: #BDD5EC;
        opacity: 0.5;
        background-color: #292b2c;
        text-align: right;
        height: 5%;
    }

    input[type="text"],
    input[type="search"],
    select.form-control {
        background: transparent;
        border: none;
        border-bottom: 1px solid;
        -webkit-box-shadow: none;
        box-shadow: none;
        border-radius: 0;
    }

    input[type="text"]:focus,
    input[type="search"]:focus,
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

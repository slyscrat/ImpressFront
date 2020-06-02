<template>
    <b-modal class="login-container" id="loginModal"
    hide-footer hide-header :show="this.$store.getters['helpers/authorization']">
        <b-form>
            <b-row class="login-form-elem">
                <b-col class="text-center">
                    <h4>
                        Авторизация
                    </h4>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="E-mail">
                        <b-input id="username-input"
                                 type="text"
                                 v-model="email"
                                 @click="clearError"
                        />
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="Пароль">
                        <b-input id="password-input"
                                 type="password"
                                 v-model="password"
                                 @click="clearError"
                        />
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col class="text-center">
                    <a
                            style="color: blue;"
                            onmouseover="this.style.color='red'"
                            onmouseout="this.style.color='blue'"
                            @click="registration"
                            type="submit"
                    >
                        Нет аккаунта?
                    </a>
                    <b-button @click="performLogin"
                              size="lg"
                              type="submit"
                              v-if="!authenticationInProgress"
                              variant="primary"
                    >
                        Войти
                    </b-button>
                    <b-spinner label="Spinning" type="grow" v-else variant="primary"/>
                </b-col>
            </b-row>
            <b-row class="login-form-elem" v-if="authenticationError.length > 0">
                <b-col class="text-center" offset="1" sm="10">
                    <b-alert :show="authenticationError.length > 0" variant="danger">{{authenticationError}}</b-alert>
                </b-col>
            </b-row>
        </b-form>
    </b-modal>
</template>

<script>
    import {API_SERVER_PATH, ROLE_ADMIN, ROLE_USER} from "@/utils/constants";
    import axios from "axios";
    import {AUTHENTICATE, LOGOUT} from "@/store/modules/security";
    import {REG, CLEAN} from "@/store/modules/helpers";
    import {mapMutations} from "vuex";

    export default {
        name: "LoginModal",
        data() {
            return {
                email: "",
                password: "",
                authenticationError: "",
                authenticationInProgress: false
            }
        },
        methods: {
            ...mapMutations('security', {
                authenticate: AUTHENTICATE,
                logout: LOGOUT
            }),
            ...mapMutations('helpers', {
                register: REG,
                clean: CLEAN
            }),
            clearError(){
                this.authenticationError = "";
            },
            closeModal() {
                this.$nextTick(() => {
                    this.$bvModal.hide('loginModal');
                })
            },
            registration() {
                this.$emit('register', true);
                this.closeModal();
            },
            performLogin() {
                this.authenticationInProgress = true;
                axios.post(API_SERVER_PATH + "/auth/login", {
                    email: this.email,
                    password: this.password
                }).then((response) => {
                    this.authenticationInProgress = false;
                    this.authenticate({
                        oldId: this.$store.getters['security/id'],
                        id: response.data['userId'],
                        email: this.email,
                        password: this.password,
                        role: response.data['userId'] === 1 ? ROLE_ADMIN : ROLE_USER,
                        token: response.data['token'],
                    });
                    this.clean();
                    this.$emit('auth', true);
                    this.closeModal();
                    /*if (response.data['userId'] === 1)
                        this.$router.push('/admin/movie/list');
                    else
                        this.$router.push('/movie/list');*/

/*                    */

                }).catch((error) => {
                    this.authenticationInProgress = false;
                    if (error.response) {
                        this.authenticationError = "Неверный логин или пароль. Попробуйте еще раз";
                    } else if (error.request) {
                        this.authenticationError = "Сервер не отвечает";
                    }
                    this.logout();
                });
            }
        }
    }
</script>

<style scoped>
    .login-container {
        border-radius: 30px;
        padding: 2% 0;
        margin: 5% 35%;
        background-color: whitesmoke;
        width: 30%;
    }

    .input-group>.input-group-prepend {
        flex: 0 0 28%;
    }

    .input-group .input-group-text {
        width: 100%;
        justify-content: center;
    }

    .login-form-elem {
        padding: 10px 0 5px 0;
        margin: 10px;
    }

</style>
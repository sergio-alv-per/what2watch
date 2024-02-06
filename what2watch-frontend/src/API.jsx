let __instance = null

export default class API {
  #baseUrl = "what2watch-backend.onrender.com"

  static instance() {
    // Singleton
    if (__instance == null) __instance = new API()

    return __instance
  }

  getHTTPSURLForPath(path) {
    return "https://" + this.#baseUrl + path
  }

  getWSSURLForPath(path) {
    return "ws://" + this.#baseUrl + path
  }
}

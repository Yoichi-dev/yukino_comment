<template>
  <div class="bgimg" id="gift">
    <Comment :comment="commentData" />
  </div>
</template>

<script>
import { gsap } from "gsap";
import axios from "~/plugins/axios";
import constants from "~/constants";

export default {
  name: "IndexPage",
  data() {
    return {
      commentData: {
        id: null,
        name: null,
        comment: null,
        flg: null,
        avatar: null,
      },
      srSocket: null,
      roomStatus: null,
      srSocketPing: null,
      bcsvr_key: null,
      fallFlg: true,
    };
  },
  head() {
    return {
      title: "雪乃クリスタル専用コメントビューワー",
    };
  },
  mounted() {
    axios
      .post(constants.url.showroom_api, {
        category: "room",
        type: "status",
        key: constants.roomUrl,
      })
      .then((res) => {
        this.roomStatus = res.data;
        this.bcsvr_key = res.data.broadcast_key;
        this.srConnect(res.data.broadcast_key);
      })
      .catch((e) => {
        console.log("プレミアム配信かも？");
        this.premiumLive();
      });
  },
  methods: {
    premiumLive() {
      const checkStreaming = setInterval(() => {
        axios
          .post(constants.url.showroom_api, {
            category: "live",
            type: "onlives",
            key: new Date().getTime(),
          })
          .then((res) => {
            const premiumList = [];
            for (let i = 0; i < res.data.onlives.length; i++) {
              if (
                res.data.onlives[i].genre_id >= 100 &&
                res.data.onlives[i].genre_id <= 200
              ) {
                const check = res.data.onlives[i].lives.find(
                  (e) => e.premium_room_type === 1
                );
                if (check !== undefined) {
                  premiumList.push(check);
                }
              }
            }
            if (premiumList.length !== 0) {
              for (const data of premiumList) {
                if (data.room_id === Number(localStorage.room_id)) {
                  this.bcsvr_key = data.bcsvr_key;
                  this.roomStatus = data;
                  clearInterval(checkStreaming);
                  // 接続
                  this.srConnect(data.bcsvr_key);
                  break;
                }
              }
            }
          });
      }, 5000);
    },
    srConnect(bcsvrKey) {
      // 接続
      this.srSocket = new WebSocket(constants.ws);
      // 接続確認
      this.srSocket.onopen = (e) => {
        console.log("接続");
        this.srSocket.send(`SUB\t${bcsvrKey}`);
      };
      // 疎通確認
      this.srSocketPing = setInterval(() => {
        this.srSocket.send("PING\tshowroom");
        // this.fallFlg = true;
      }, 60000);
      // エラー発生時
      this.srSocket.onerror = (e) => {
        this.srSocket.close();
        clearInterval(this.srSocketPing);
        // 再接続
        this.srConnect(this.bcsvr_key);
      };
      // メッセージ受信
      this.srSocket.onmessage = (data) => {
        // 死活監視
        if (
          data.data === "ACK\tshowroom" ||
          data.data === "Could not decode a text frame as UTF-8."
        ) {
          return;
        }
        // エラー
        if (data.data === "ERR") {
          this.srSocket.close();
          clearInterval(this.srSocketPing);
          // 再接続
          this.srConnect(this.bcsvr_key);
        }

        // JSON変換
        const msgJson = JSON.parse(data.data.split(`MSG\t${bcsvrKey}`)[1]);

        switch (msgJson.t) {
          case "1":
            if (this.commentCountCheck(msgJson)) {
              // コメント追加
              this.commentData = {
                id: msgJson.u,
                name: msgJson.ac,
                comment: msgJson.cm,
                flg: msgJson.ua,
                avatar: `https://image.showroom-cdn.com/showroom-prod/image/avatar/${msgJson.av}.png?v=85`,
              };
            }
            break;
          case "2":
            // ギフト
            if (this.giftCheck(msgJson)) {
              // 無料
              if (this.fallFlg) {
                this.fallGiftFree(msgJson);
              }
            } else {
              // 有料
              this.fallGift(msgJson);
            }
            break;
          case 101:
            console.log("配信終了");
            console.log(msgJson.created_at);
            this.srSocket.close();
            clearInterval(this.srSocketPing);
            console.log("切断");
            location.reload();
            break;
          case 104:
            this.srSocket.close();
            clearInterval(this.srSocketPing);
            // 再接続
            location.reload();
            break;
          default:
          // console.log(msgJson)
        }
      };
    },
    commentCountCheck(msgJson) {
      // 全角数字を半角に変換
      const numberFormat = msgJson.cm.replace(/[０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      });
      if (
        !isNaN(numberFormat) &&
        Number(numberFormat) >= 0 &&
        Number(numberFormat) <= 50
      ) {
        // カウント
        return false;
      } else {
        // コメント
        return true;
      }
    },
    giftCheck(msgJson) {
      // ギフトチェック
      if (msgJson.gt === 2) {
        // 投票
        if (Number(msgJson.g) > 10000 && Number(msgJson.g) <= 10070) {
          // 投票ボール
        } else if (msgJson.g === 1601) {
          // 虹星
          return false;
        } else if (
          msgJson.g === 1 ||
          msgJson.g === 1001 ||
          msgJson.g === 1002 ||
          msgJson.g === 1003 ||
          msgJson.g === 2 ||
          msgJson.g === 1501 ||
          msgJson.g === 1502 ||
          msgJson.g === 1503 ||
          msgJson.g === 1504 ||
          msgJson.g === 1505
        ) {
          // 無料
          return true;
        } else {
          // 星以外のフリーギフト
          return false;
        }
      } else {
        // 有料
        return false;
      }
    },
    fallGiftFree(gift) {
      // 画面幅を取得
      const width = window.innerWidth;
      const elmId = Math.random().toString(32).substring(2);

      // ギフトの数分ループ
      for (let i = 0; i < gift.n; i++) {
        // 要素のID
        const id = `gift_${gift.u}_${gift.g}_${i}_${elmId}`;
        // ギフト画像の要素を作成
        const giftImgElement = document.createElement("img");
        // 画像を設定
        if (i <= 5) {
          giftImgElement.src = require(`@/assets/image/${i}.png`);
          giftImgElement.style.width = "50px";
        } else if (i === 10) {
          giftImgElement.src = `https://image.showroom-cdn.com/showroom-prod/image/avatar/${gift.av}.png`;
          giftImgElement.style.width = "50px";
        } else {
          giftImgElement.src = require(`@/assets/image/${Math.floor(
            this.getRandomNum(0, 5)
          )}.png`);
          giftImgElement.style.width = "50px";
        }

        // IDを設定
        giftImgElement.setAttribute("id", id);
        // 配置位置を設定
        giftImgElement.style.position = "absolute";
        giftImgElement.style.top = "-25px"; // 画面外に配置
        giftImgElement.style.left = this.getRandomNum(10, width - 70) + "px"; // ランダムに配置
        // ギフト要素を画面に追加
        document.getElementById("gift").append(giftImgElement);

        // 動きを追加
        this.gsaoExe(id);
      }
    },
    fallGift(gift) {
      // 画面幅を取得
      const width = window.innerWidth;
      const elmId = Math.random().toString(32).substring(2);

      // ギフトの数分ループ
      for (let i = 0; i < gift.n; i++) {
        // 要素のID
        const id = `gift_${gift.u}_${gift.g}_${i}_${elmId}`;
        // ギフト画像の要素を作成
        const giftImgElement = document.createElement("img");
        // 画像を設定
        giftImgElement.src = `https://image.showroom-cdn.com/showroom-prod/assets/img/gift/${gift.g}_s.png`;
        giftImgElement.style.width = "100px";
        // IDを設定
        giftImgElement.setAttribute("id", id);
        // 配置位置を設定
        giftImgElement.style.position = "absolute";
        giftImgElement.style.top = "-25px"; // 画面外に配置
        giftImgElement.style.left = this.getRandomNum(10, width - 70) + "px"; // ランダムに配置
        // ギフト要素を画面に追加
        document.getElementById("gift").append(giftImgElement);

        // 動きを追加
        this.gsaoExe(id);
      }
    },
    gsaoExe(elementId) {
      let height = window.innerHeight;
      gsap.to(`#${elementId}`, {
        duration: this.getRandomNum(6, 9), // 2秒～5秒の間で移動
        rotation: this.getRandomNum(90, 720), // 回転角度
        y: height - 60, // 落ちる高さ
        onComplete: () => {
          if (document.getElementById(elementId) !== null) {
            document.getElementById(elementId).remove(); // 終わったら要素を削除
          }
        },
      });
      setTimeout(() => {
        if (document.getElementById(elementId) !== null) {
          document.getElementById(elementId).remove();
        }
      }, 10000);
    },
    getRandomNum(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.random() * (max - min + 1) + min;
    },
  },
};
</script>

<style scoped>
.bgimg {
  width: 1920px;
  height: 1080px;
  background-image: url("~/assets/image/bg2.png");
}
</style>
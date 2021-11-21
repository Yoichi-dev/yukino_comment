<template>
  <div>
    <div class="freegiftArea scrollbar">
      <div id="freegift">
        <div
          class="freegift"
          v-for="(freeGift, index) in freeGiftList"
          :key="index"
        >
          <div class="name">{{ freeGift.name }}</div>
          <div class="fukidasi left">
            <img
              alt=""
              width="30px"
              height="30px"
              class="img-responsive gift-img"
              style="float: left"
              :src="
                'https://image.showroom-cdn.com/showroom-prod/assets/img/gift/' +
                freeGift.gitId +
                '_s.png'
              "
              data-holder-rendered="true"
            />
            × {{ freeGift.num }}
            <img
              class="icon"
              :src="
                'https://image.showroom-cdn.com/showroom-prod/image/avatar/' +
                freeGift.avatar +
                '.png?v=85'
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["freeGiftList"],
};
</script>

<style>
.scrollbar {
  overflow: scroll;
}

.scrollbar::-webkit-scrollbar {
  display: none;
}

.fontrogo {
  font-family: "rogotype" !important;
}

.freegiftArea {
  margin-top: 23vh;
  margin-left: 85px;
  float: left;
  width: 18vw;
  height: 26vh;
  font-family: "rogotype";
}

.stamp {
  background: initial !important;
}
.stamp::after {
  box-shadow: initial !important;
}

.freegift {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 10px 0;
  font-family: "rogotype" !important;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
}

.freegift .fukidasi {
  position: relative;
  display: inline-block;
  max-width: 273px;
  border-radius: 19px;
  overflow-wrap: break-word;
  clear: both;
  box-sizing: content-box; /*はてな用*/
}

.freegift .fukidasi.left {
  float: left;
  margin-left: 62px;
}

.freegift .name + .fukidasi.left {
  font-size: 25px;
}

.freegift .name {
  clear: right;
  font-size: 20px;
  margin-left: 62px;
  color: black;
}

.freegift .icon {
  margin-top: 10px;
  position: absolute;
  width: 50px;
  height: 50px;
  left: -54px;
  top: -2px;
}

.freegift .name + .left .icon {
  top: -1.8em;
}

.freegift .fukidasi::after {
  position: absolute;
  content: "";
  width: 24px;
  height: 36px;
  top: -21px;
}

.freegift .fukidasi.left:after {
  left: -10px;
  border-radius: 18px 0 6px 18px/18px 0 1px 18px;
}

.freegift .left + .left::after {
  content: none;
}
</style>
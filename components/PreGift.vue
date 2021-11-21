<template>
  <div>
    <div class="pregiftArea scrollbar">
      <div id="pregift">
        <div
          class="pregift"
          v-for="(pregift, index) in preGiftList"
          :key="index"
        >
          <div class="name">{{ pregift.name }}</div>
          <div class="fukidasi left">
            <img
              alt=""
              width="30px"
              height="30px"
              class="img-responsive gift-img"
              style="float: left"
              :src="
                'https://image.showroom-cdn.com/showroom-prod/assets/img/gift/' +
                pregift.gitId +
                '_s.png'
              "
              data-holder-rendered="true"
            />
            × {{ pregift.num }}
            <img
              class="icon"
              :src="
                'https://image.showroom-cdn.com/showroom-prod/image/avatar/' +
                pregift.avatar +
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
  props: ["preGiftList"],
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

.pregiftArea {
  margin-top: 49vh;
  margin-left: 85px;
  float: left;
  width: 18vw;
  height: 24vh;
  font-family: "rogotype";
  position: absolute;
}

.stamp {
  background: initial !important;
}
.stamp::after {
  box-shadow: initial !important;
}

.pregift {
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

.pregift .fukidasi {
  position: relative;
  display: inline-block;
  max-width: 273px;
  border-radius: 19px;
  overflow-wrap: break-word;
  clear: both;
  box-sizing: content-box; /*はてな用*/
}

.pregift .fukidasi.left {
  float: left;
  margin-left: 62px;
}

.pregift .name + .fukidasi.left {
  font-size: 25px;
}

.pregift .name {
  clear: right;
  font-size: 20px;
  margin-left: 62px;
  color: black;
}

.pregift .icon {
  margin-top: 10px;
  position: absolute;
  width: 50px;
  height: 50px;
  left: -54px;
  top: -2px;
}

.pregift .name + .left .icon {
  top: -1.8em;
}

.pregift .fukidasi::after {
  position: absolute;
  content: "";
  width: 24px;
  height: 36px;
  top: -21px;
}

.pregift .fukidasi.left:after {
  left: -10px;
  border-radius: 18px 0 6px 18px/18px 0 1px 18px;
}

.pregift .left + .left::after {
  content: none;
}
</style>
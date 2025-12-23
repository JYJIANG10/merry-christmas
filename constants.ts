
import * as THREE from 'three';

export const TREE_CONFIG = {
  PARTICLE_COUNT: 20000, 
  HEIGHT: 15,
  BASE_RADIUS: 5,
  CENTER_COLOR: new THREE.Color('#ff80c0'), 
  OUTER_COLOR: new THREE.Color('#ffe0ed'),  
  EDGE_COLOR: new THREE.Color('#ffffff'),   
};

export const SNOW_CONFIG = {
  COUNT: 4000, 
  SPEED: 0.025,
  BOUNDS: { x: 50, y: 35, z: 50 }
};

export const BASE_RINGS_CONFIG = {
  RADIUS_MULT: [1.5, 1.85, 2.2], 
  WHITE_COLOR: new THREE.Color('#ffffff'), 
  GOLD_COLOR: new THREE.Color('#ffd700'),
  PARTICLES_PER_RING: 1000 
};

export const POST_PROCESSING = {
  BLOOM_INTENSITY: 1.2, 
  BLOOM_LUMINANCE_THRESHOLD: 0.2, 
  BLOOM_LUMINANCE_SMOOTHING: 0.9
};

export const DEFAULT_GIFT_IMAGES = [
   "https://pub-186562a1884d41cab825cea6778eec78.r2.dev/IMG_1985.jpg",
   "https://pub-186562a1884d41cab825cea6778eec78.r2.dev/IMG_1986.jpg",
   "https://pub-186562a1884d41cab825cea6778eec78.r2.dev/IMG_1987.jpg",
   "https://pub-186562a1884d41cab825cea6778eec78.r2.dev/IMG_5316.jpg",
   "https://pub-186562a1884d41cab825cea6778eec78.r2.dev/IMG_7368.jpg"
];

export const DEFAULT_WISHES = [
  { text: "MISS U SO MUCH" },
  { text: "希望你在我身边" },
  { text: "早日遇到你爱也真诚爱你的男人" },
  { text: "祝你平安顺遂的度过这个本命年尾巴" },
  { text: "最好的熹，见字如晤，今年真的是发生了很多事情的一年呢。我好像终于学会了及时止损，拥有了大刀阔斧斩断消耗自己的关系的决心，无论是爱情还是友情。代价是，冻结了我的期待、相信和热情。于是我把自己蜷缩起来度过这个秋冬，感受平和。我有默默想念很多次打个车就去你家过周末的时刻，在沙漠里看星空的时刻，一起蹦了不知道多少场迪...也在适应不擅长的异地关系。慢慢学会接受关系的“平淡”，荣亲的珍贵在与细水长流。其实我觉得咱们俩都是情感内敛，报喜不报忧的类型。但如果你需要我，我一直都在。春天就要来啦，我们一定都会幸福的！爱你的JBL" }
];

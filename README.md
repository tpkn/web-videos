# Web Videos [![npm Package](https://img.shields.io/npm/v/web-videos.svg)](https://www.npmjs.org/package/web-videos)
Converts mp4 to a full (almost) pack of formats for web using NodeJS and FFmpeg


Features:
 * You choose the formats you need:
   * video: `mp4`, `webm`, `ogv`
   * audio: `mp3`, `aac`
   * image: `gif`, high quality `gif`, `poster` image
 * Set quality to each format individually 
 * Mute video by setting `audio: 0` option
 * Converting processes are queued, so there is no need to worry about CPU overload



## Installation
```bash
npm install web-videos
```


## API

### WebVideos(file[, options])

### file
**Type**: _String_   
Path to the video file


### options.bin
**Type**: _String_  
**Default**: `ffmpeg`  
Path to [FFmpeg](http://ffmpeg.org/download.html) binary file  


### options.gifski
**Type**: _String_  
**Default**: `gifski`  
Path to [Gifski](https://github.com/ImageOptim/gifski/releases) binary file, if you need high quality gifs  


### options.output_dir
**Type**: _String_  
**Default**: `same as input file`  


### options.temp_dir
**Type**: _String_  
**Default**: `same as input file`  
Folder for temp files, such as frame sequence for gif


### options.formats
**Type**: _Array_  
If not set, then using preset `mp4 + webm + poster` with `1000k` video quality, `128k` audio and poster is `jpg` with highest quality (`1`)

#### Video properties   
  * `format` <**String**>: mp4 | webm | ogv
  * `video` <**String**>: `1000k` by default
  * `audio` <**String**>: `128k` by default | `0` = muted


#### Audio properties   
  * `format` <**String**>: mp3 | aac
  * `audio` <**String**>: `128k` by default


#### Gif properties   
  * `format` <**String**>: gif | gifski
  * `quality` <**Number**> Gifski: 1 - 100 (100 = highest)
  * `fps` <**Number**>: `8` by default
  * `loop` (**Boolean**):


#### Poster properties   
  * `format` <**String**>: poster
  * `quality` <**Number**>: 1 - 31 (1 = highest)
  * `time` <**Number**>: `1`st second by default



## Usage
```javascript
const WebVideos = require('web-videos');

let video = './videos/MONICA BELLUCCI in the Matrix Sequels (HD Movie Scenes).mp4';

(async () => {

   let results = await WebVideos(video, {
      bin: './bin/ffmpeg.exe',
      gifski: './bin/gifski.exe',
      output_dir: './videos/converted',
      temp_dir: './videos/temp',
      formats: [
         { format: 'mp4', video: '2000k', audio: '128k' },
         { format: 'webm', video: '2000k' },
         { format: 'ogv', audio: 0 },

         { format: 'mp3', audio: '96k' },
         { format: 'aac', audio: '96k' },
         
         { format: 'gif', fps: 8, loop: true },
         { format: 'gifski', quality: 75, fps: 24, loop: false },
         { format: 'poster', time: 1, quality: 1 },
      ]
   });
   
   console.log(results);
   // => [
   //  'videos/converted/video.mp4',
   //  'videos/converted/video.webm',
   //  'videos/converted/video.ogv',
   //  'videos/converted/video.gif',
   //  'videos/converted/video_hq.gif',
   //  'videos/converted/video_poster.jpg',
   //  'videos/converted/video.mp3',
   //  'videos/converted/video.aac'
   // ]

})().catch(err => console.log(err));

```


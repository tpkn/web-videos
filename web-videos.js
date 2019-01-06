/*!
 * Web Videos, http://tpkn.me/
 */
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

function uniq(short = false){
   let id = (Math.random() + Math.random() + Math.random() + Date.now()).toString(36).replace('.', '');
   return short ? id.substr(6, 3) : id;
};

function webVideos(input_file, options = {}){
   return new Promise((resolve, reject) => {

      // Check if input file exists
      if(!fs.existsSync(input_file)){
         throw new TypeError(`"${input_file}" dir does not exist`);
      }


      // User's options
      let { 
         bin = 'ffmpeg',
         gifski = path.join('./bin/', 'gifski.exe'),
         filename = path.basename(input_file, path.extname(input_file)) + '_' + uniq(),
         output_dir = path.parse(input_file).dir,
         temp_dir = path.parse(input_file).dir,
         formats = [{ format: 'mp4' }, { format: 'webm' }, { format: 'poster' }]
      } = options;


      // Output file path (without extension)
      let output_file = path.join(output_dir, filename);
      // Temp folder path
      let output_temp = path.join(temp_dir, filename + '_temp');
      // FFmpeg frame sequence mask
      let frames_path = path.join(output_temp, 'frame%09d.png');
      // Gifski frame sequence mask
      let frames_mask = path.join(output_temp, '*.png');


      // Check if output folder exists
      if(!fs.existsSync(output_dir)){
         throw new TypeError(`${output_dir} dir does not exist`);
      }

      // Make sure we don't replace existining file
      if(fs.existsSync(output_file)){
         throw new Error(`output file ${output_file} already exist`);
      }


      let stderr = [];
      let report = [];
      let commands_list = [];
      
      for(let i = 0, len = formats.length; i < len; i++){
         let cmd;

         let {
            format, 
            video = '1000k', 
            audio = '128k', 
            time = 1,
            fps = 8,
            loop = true, 
            quality = 1
         } = formats[i];

         let muted = audio == 0 ? '-an' : '';
         let looped = loop ? '' : '-loop -1';
         let looped_gifski = loop ? '' : '--once';

         
         // Form a CMD string
         switch(format){

            // Video
            case 'mp4':
               cmd = `${bin} -i "${input_file}" -vcodec h264 -acodec aac -strict -2 -b:v ${video} ${muted} -ar 44100 -ab ${audio} -ac 2 -y "${output_file}.mp4"`;
               report.push(output_file + '.' + format);
            break;
            case 'webm':
               cmd = `${bin} -i "${input_file}" -f webm -vcodec libvpx -acodec libvorbis -b:v ${video} ${muted} -ar 44100 -ab ${audio} -ac 2 -y "${output_file}.webm"`;
               report.push(output_file + '.' + format);
            break;
            case 'ogv':
               cmd = `${bin} -i "${input_file}" -codec:v libtheora -codec:a libvorbis -b:v ${video} ${muted} -ar 44100 -ab ${audio} -ac 2 -y "${output_file}.ogv"`;
               report.push(output_file + '.' + format);
            break;


            // Audio
            case 'mp3':
               cmd = `${bin} -i "${input_file}" -vn -ar 44100 -ac 2 -ab ${audio} -f mp3 "${output_file}.mp3"`;
               report.push(output_file + '.' + format);
            break;
            case 'aac':
               cmd = `${bin} -i "${input_file}" -vn -acodec copy "${output_file}.aac"`;
               report.push(output_file + '.' + format);
            break;


            // Gif
            case 'gif':
               cmd = `${bin} -i "${input_file}" -r ${fps} ${looped} "${output_file}.gif"`;
               report.push(output_file + '.' + format);
            break;

            // Gif (using Gifski)
            case 'gifski':
               fs.mkdirSync(output_temp);
               cmd =  `(`;
               cmd +=    `${bin} -i "${input_file}" -r ${fps} -f image2 "${frames_path}" && `;
               cmd +=    `${gifski} --quality ${quality} --fps ${fps} ${looped_gifski} ${frames_mask} --output "${output_file}_hq.gif"`;
               cmd += `)`;
               report.push(output_file + '_hq.gif');
            break;

            // Poster image
            case 'poster':
               cmd = `${bin} -i "${input_file}" -ss ${time} -vframes 1 -q:v ${quality} "${output_file}_poster.jpg"`;
               report.push(output_file + '_poster.jpg');
            break;
         }

         if(cmd){
            commands_list.push(cmd);
         }
      }


      // Reject if nothing to process
      if(!commands_list.length){
         throw new Error('there is no acceptable formats');
      }


      let std = spawn(commands_list.join(' & '), { shell: true });
      std.stdout.on('data', (data) => {
         // console.log(`stdout: ${data}`);
      });

      std.stderr.on('data', (data) => {
         stderr.push(data);
      });

      std.on('close', (code) => {
         if(code == 1){
            throw new Error(stderr);
         }

         resolve(report);

      });
   });
}

module.exports = webVideos;

$("#new-file").click(function() {
    $("#file_input").click();
    document.getElementById('file_input').addEventListener('change', function () {
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        file = this.files[0],
        chunkSize = 2097152,                             // Read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader(),
        old_file = document.getElementsByClassName('file_len'),
        count = [],
        my_filename = file.name;
        //console.info('file_name', file.name);
    for (var i =0; i < old_file.length; i++){
        if (file.name === old_file[i].innerHTML) 
            count.push(0);
        else if ( file.name === old_file[i].innerHTML.substring(0, old_file[i].innerHTML.lastIndexOf('(') ) ){
            number = Number( old_file[i].innerHTML.substring( old_file[i].innerHTML.lastIndexOf('(') + 1, old_file[i].innerHTML.lastIndexOf(')') ) );
            count.push(number);
        }
    }
            
    count.sort();

    for (i = 0; i < count.length; i++){
        if (i < count[i]){
            if (i > 0)
                my_filename += '(' + i + ')';
            break;
        }
    }
    console.log(count);
    console.log(count.length);
    console.log('i:' + i);
    if (i === count.length && i > 0)
        my_filename += '(' + i + ')';
    console.log(my_filename);

    fileReader.onload = function (e) {
        //console.log('计算第', currentChunk + 1, '：共', chunks);
        spark.append(e.target.result);                   // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
            loadNext();
        } else {
            //console.log('文件大小：', file.size /(1024*1024) ,'MB');
            var md5 = spark.end();
            md5 = md5.toUpperCase();
            //console.info('md5值：', md5);  // Compute hash
            //var ajax = new    XMLHttpRequest();
            var local_url = window.location.href;
            //console.info('url',local_url);

            $.ajax({
                
                url: local_url,
                type: 'get',
                data: {'md5':md5, 'file_name':my_filename},
                success: function(data){
                    // body...
                    if (data === 'Y'){
                        alert('已秒传');
                        location.reload(true);
                    }
                    else if (data === 'N'){
                        /*
                        console.log('不能秒传');
                        document.getElementById('file_md5').value = md5;
                    
                        $("#file_upload").submit();*/
                        var formData = new FormData();
                        formData.append('file_md5', md5);
                        formData.append('file_name', my_filename);
                        formData.append('new_file', file);
                        
                        $.ajax({
                            url: local_url,
                            type: 'post',
                            data: formData,
                            processData: false,
                            contentType: false,
                            xhr: function(){
                                var xhr = $.ajaxSettings.xhr();
                                xhr.upload.addEventListener('progress', onprogress, false);
                                return xhr;
                            },

                            success: function(data){
                                location.reload(true);
                            }
                        });
                    }
                }  
            });

        }
    };

    fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
    };

    function loadNext() {
        var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
    }); //document....function

});

$('#new_folder').click(function(){
    var new_folder = document.getElementById('new_folder_form');
    new_folder.style.setProperty('display', 'inline');
});

$('#new_folder_ok').click(function(event){
    event.preventDefault();
    var folder = document.getElementsByClassName('folder_len');
    var count = [];
    var folder_input = document.getElementById('new_folder_input');
    var blob = new Blob([folder_input.value]);

    if (folder_input.value === ''){
        alert('文件名不能为空');
        return;
    }

    console.log(blob.size);
    if (blob.size > 256){
    	alert('文件夹名过长，请重新输入');
    	return;
    }

    for (var i = 0; i < folder.length; i++){
        if (folder_input.value === folder[i].innerHTML) 
            count.push(0);
        else if ( folder_input.value === folder[i].innerHTML.substring(0, folder[i].innerHTML.lastIndexOf('(') ) ){
            number = Number( folder[i].innerHTML.substring( folder[i].innerHTML.lastIndexOf('(') + 1, folder[i].innerHTML.lastIndexOf(')') ) );
            count.push(number);
        }
    }
    count.sort();
    for ( i = 0; i < count.length; i++){
        if (i < count[i]){
            if (i > 0)
                folder_input.value += '(' + i + ')';
            break;
        }
    }
    if (i === count.length && i > 0)
        folder_input.value += '(' + i + ')';
    $('#new_folder_form').submit();
});

$('#new_folder_off').click(function(event){
    event.preventDefault();
    var new_folder = document.getElementById('new_folder_form');
    new_folder.style.setProperty('display', 'none');
});


function onprogress(evt){
　 var loaded = evt.loaded;                  //已经上传大小情况 
   var tot = evt.total;                      //附件总大小 
   var per = Math.floor(100*loaded/tot);     //已经上传的百分比  
   var progress = document.getElementById('progress');
   progress.style.width = 144*loaded/tot + 'px';
   var percent = document.getElementById('percent');
   percent.innerHTML=per+'%';
}





function rename_btn(event,i){
    event.preventDefault();
    var div1 = document.getElementById('rename_input'+i).style;
    var div2 = document.getElementById('ok_btn'+i).style;
    var div3 = document.getElementById('off_btn'+i).style;
    var filename = document.getElementById('filename'+i).style;
    div1.setProperty('display','inline');
    div2.setProperty('display','inline');
    div3.setProperty('display','inline');
    filename.setProperty('display', 'none');

}

function rename_off(event,i){
    event.preventDefault();
    var div1 = document.getElementById('rename_input'+i).style;
    var div2 = document.getElementById('ok_btn'+i).style;
    var div3 = document.getElementById('off_btn'+i).style;
    var filename = document.getElementById('filename'+i).style;
    document.getElementById('rename_input'+i).value = "";
    div1.setProperty('display','none');
    div2.setProperty('display','none');
    div3.setProperty('display','none');
    filename.setProperty('display', 'inline');
}

function rename_submit(event, num, old_name){
    event.preventDefault();
    var old_folder = document.getElementsByClassName('folder_len');
    var old_file = document.getElementsByClassName('file_len');
    var new_name = document.getElementById('rename_input'+num);
    var count = [];
    var number;
    var j;
    if (new_name.value ===''){
        alert('文件名不能为空');
        return;
    }

    if (new_name.value === old_name){
        rename_off(event,num);
        return;
    }
    if (new_name.className === 'rename_hidden_folder'){
        for (i =0; i < old_folder.length; i++){
            if (new_name.value === old_folder[i].innerHTML) 
                count.push(0);
            else if ( new_name.value === old_folder[i].innerHTML.substring(0, old_folder[i].innerHTML.lastIndexOf('(') ) ){
                number = Number( old_folder[i].innerHTML.substring( old_folder[i].innerHTML.lastIndexOf('(') + 1, old_folder[i].innerHTML.lastIndexOf(')') ) );
                count.push(number);
            }
        }
            
    }
    if (new_name.className === 'rename_hidden_file'){
        for (i =0; i < old_file.length; i++){
            if (new_name.value === old_file[i].innerHTML) 
                count.push(0);
            else if ( new_name.value === old_file[i].innerHTML.substring(0, old_file[i].innerHTML.lastIndexOf('(') ) ){
                number = Number( old_file[i].innerHTML.substring( old_file[i].innerHTML.lastIndexOf('(') + 1, old_file[i].innerHTML.lastIndexOf(')') ) );
                count.push(number);
            }
        }
            
    }
    count.sort();
    for (i = 0; i < count.length; i++){
        if (i < count[i]){
            if (i > 0)
                new_name.value += '(' + i + ')';
            break;
        }
    }
    if (i === count.length && i > 0)
        new_name.value += '(' + i + ')';
    //console.log(new_name.value);
    //console.log(old_name);
    document.getElementById('rename_input_old'+num).value = old_name;
    document.getElementById('folder_view' +num).submit();
    
}

function delete_file(event,file_name){
    event.preventDefault();
    console.info(file_name);
    $.ajax({
        url: window.location.href,
        type: 'get',
        data: {delete_file_name: file_name},
        success: function(data){
            location.reload(true);
        }
    });
}


function delete_folder(event,folder_name){
    event.preventDefault();
    $.ajax({
        //url: window.location.href,
        type: 'get',
        data: {delete_folder_name: folder_name},
        success: function(data){
            location.reload(true);
        }
    });
}


//var if_paste_file = false;
var paste_file_name = '';
var paste_file_pdir = '';

function copy_file(event, file_name){
    event.preventDefault();
    //if_paste_file = true;
    paste_file_name = file_name;
    console.log(paste_file_name);
    var url = window.location.href;
    paste_file_pdir = url.split('/').pop();
    $.ajax({
        url: url,
        type: 'get',
        data: {paste_file_name: paste_file_name, paste_file_pdir: paste_file_pdir},
        success: function(data){
            location.reload(true);
        }
    });
}


function paste_file(event, file_name){
    event.preventDefault();
    //if_paste_file = true;
    paste_file_name = file_name;
    var url = window.location.href;
    paste_file_pdir = url.split('/').pop();
    $.ajax({
        url: url,
        type: 'get',
        data: {cut_file_name: paste_file_name, cut_file_pdir: paste_file_pdir},
        success: function(data){
            location.reload(true);
        }
    });
}


$('#paste_file').click(function() {

    $.ajax({
        url: window.location.href,
        type: 'get',
        data: {what_file: 'Y'},
        success: function(data){
            var new_data = data.substring(0, data.lastIndexOf('(') );
            if (new_data != '')
                data = new_data;
            var count=[];
            var post_data = '';
            var old_file = document.getElementsByClassName('file_len');
            for (var i =0; i < old_file.length; i++){
                if (data === old_file[i].innerHTML) 
                    count.push(0);
                else if ( data === old_file[i].innerHTML.substring(0, old_file[i].innerHTML.lastIndexOf('(') ) ){
                    number = Number( old_file[i].innerHTML.substring( old_file[i].innerHTML.lastIndexOf('(') + 1, old_file[i].innerHTML.lastIndexOf(')') ) );
                    count.push(number);
                }
            }
            count.sort();
            for (i = 0; i < count.length; i++){
                if (i < count[i]){
                    if (i > 0)
                    post_data = '(' + i + ')';
                break;
                }
            }
            if (i === count.length && i > 0)
                post_data = '(' + i + ')';
            console.log(post_data);
            $.ajax({
                url: window.location.href,
                type: 'get',
                data: {paste_file: 'Y', post_data: post_data},
                success: function(data1){
                    if (data1 === 'Y')
                        location.reload(true);
                    else if (data1 === 'YN')
                        alert('相同文件夹不允许剪切');
                    else
                        alert('请选择需要粘贴的文件');
                }
            });
            
            }//success
        
     });
})

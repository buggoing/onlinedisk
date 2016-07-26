var express = require('express');
var router = express.Router();
var conn  = require('../mysql').conn;
var crypto = require('crypto');
var moment = require('moment')
var multer = require('multer');
/* GET home page. */
console.log(moment().format('YYYY-MM-DD HH:mm:ss') );

router.get('/', function(req, res, next) {
  res.redirect('/users/0');
  });

router.get('/users/:path', function(req, res, next) {
  if (req.session.logined){
    var url = '/users/' + req.params.path;
    console.log(url);

    if(req.query.md5){//收到上传文件请求
      var md5 = req.query.md5;
      console.log(md5);
      console.log(req.query.file_name)
      conn.query('select * from filedata where data_MD5 = ?', [md5], function (err,result) {
        if (result.length){//秒传
          let file_name = req.query.file_name,
              file_user_name = req.session.user_name,
              file_pdir = Number(req.params.path),
              file_creat = moment().format('YYYY-MM-DD HH:mm:ss');

          if (file_pdir ===0){
            file_pdir = null;
          }

          conn.query('insert into file (file_name, file_user_name, file_pdir, file_creat, file_MD5) values (?,?,?,?,?)', [
            file_name, file_user_name, file_pdir, file_creat, md5], function (err){
            if (err){
              console.log(err);
            }
            else{
              res.send('Y');
              res.end();
            }
            
          });
          
        }
        else{//查看临时文件表
          conn.query('select * from filetemp where temp_MD5 = ?', [md5], function (err,result) {
            if (result.length){//找到临时文件
              console.log('找到临时文件');
            }
            else{
              console.log('不能秒传');
              res.send('N');
              res.end();
            }
          });
        }
      });  
    }//其他清求


    else if (req.query.new_folder){
      console.log('new_folder');
      if (req.params.path ==='0')
        var dir_pdir = null;
      else
        var dir_pdir = Number(req.params.path);
      conn.query('insert into dir (dir_name, dir_user_name, dir_pdir) values (?, ?, ?)', [req.query.new_folder, req.session.user_name, dir_pdir], function(err){
        if (err)
          console.log(err);
        else
          res.redirect(url);
      });
    }


    else if (req.query.paste_file_name){
      req.session.paste_file_name = req.query.paste_file_name;
      req.session.paste_file_pdir = req.query.paste_file_pdir;
      req.session.is_cut = false;
      res.redirect(url);
    }

    else if (req.query.cut_file_name){
      req.session.paste_file_name = req.query.cut_file_name;
      req.session.paste_file_pdir = req.query.cut_file_pdir;
      req.session.is_cut = true; 
      res.redirect(url);
    }

    else if (req.query.what_file){
      res.send(req.session.paste_file_name);
    }

    else if (req.query.paste_file){//粘贴
      if (req.session.paste_file_name){
      	let prefix = req.session.paste_file_name.substring(0, req.session.paste_file_name.lastIndexOf('('));
        if (prefix === '')
            prefix = req.session.paste_file_name;

        if (req.session.paste_file_pdir === req.params.path && req.session.is_cut)
            res.end('YN');

        else if (req.session.paste_file_pdir ==='0'){
          conn.query('select * from file where file_name = ? and file_user_name = ? and file_pdir is ?', [req.session.paste_file_name, req.session.user_name, null], function(err,result){

            let file_name = prefix + req.query.post_data,
              file_user_name = req.session.user_name,
              file_pdir = Number(req.params.path),
              file_creat = moment().format('YYYY-MM-DD HH:mm:ss'),
              file_MD5 = result[0].file_MD5;
            if (file_pdir ===0){
              file_pdir = null;
            }
            conn.query('insert into file (file_name, file_user_name, file_pdir, file_creat, file_MD5) values (?,?,?,?,?)', [file_name, file_user_name, file_pdir, file_creat, file_MD5], function (err){
              if (req.session.is_cut){
                console.log('delete form ....');
                conn.query('delete from file where file_name = ? and file_user_name = ? and file_pdir is ?', [req.session.paste_file_name, req.session.user_name, null], function(err){
                  req.session.paste_file_name = '';
                  res.end('Y');
                });
              }
              else
                res.end('Y');
            }); 
          });
        }
        else{
          conn.query('select * from file where file_name = ? and file_user_name = ? and file_pdir = ?', [req.session.paste_file_name, req.session.user_name, req.session.paste_file_pdir], function(err,result){
            let file_name = prefix + req.query.post_data,
              file_user_name = req.session.user_name,
              file_pdir = Number(req.params.path),
              file_creat = moment().format('YYYY-MM-DD HH:mm:ss'),
              file_MD5 = result[0].file_MD5;
            if (file_pdir ===0){
              file_pdir = null;
            }
            conn.query('insert into file (file_name, file_user_name, file_pdir, file_creat, file_MD5) values (?,?,?,?,?)', [file_name, file_user_name, file_pdir, file_creat, file_MD5], function (err){
              if (req.session.is_cut){
                conn.query('delete from file where file_name = ? and file_user_name = ? and file_pdir = ?', [req.session.paste_file_name, req.session.user_name, req.session.paste_file_pdir], function(err){
                  req.session.paste_file_name = '';
                  res.end('Y');
                });
              }
              else
                res.end('Y');
            }); 
          });          
        }
      }
      else{
        res.end('N');
      }
    }

    else if (req.query.delete_file_name){//删除文件
      if (req.params.path ==='0'){
        conn.query('delete from file where file_user_name = ? and file_name = ? and file_pdir is ?', [req.session.user_name, req.query.delete_file_name, null], function(err){ });
      }//res.redirect(url);
      else{
        conn.query('delete from file where file_user_name = ? and file_name = ? and file_pdir = ?', [req.session.user_name, req.query.delete_file_name, Number(req.params.path)], function(err){ });        
      }
      if (req.session.paste_file_name === req.query.delete_file_name)
        req.session.paste_file_name = '';
      res.end();
    }

    else if (req.query.delete_folder_name){//删除文件夹
      var url = '/users/' + req.params.path;
      if (req.params.path ==='0'){
       conn.query('delete from dir where dir_user_name = ? and dir_name = ? and dir_pdir is ?', [req.session.user_name, req.query.delete_folder_name, null], function(err){ });       
      }
      else{
        conn.query('delete from dir where dir_user_name = ? and dir_name = ? and dir_pdir = ?', [req.session.user_name, req.query.delete_folder_name, Number(req.params.path)], function(err){ });
      }
      res.end();
    }

    else{
      if (req.params.path === '0'){
        var sql_dir  = "select * from dir where dir_user_name =" +"'" + req.session.user_name +"'" + "and dir_pdir is NULL";
        var sql_file = "select * from file where file_user_name =" +"'" + req.session.user_name +"'" + "and file_pdir is NULL";
      }
      else{
        var sql_dir  = "select * from dir where dir_user_name =" +"'" + req.session.user_name +"'" + "and dir_pdir =" + Number(req.params.path);
        var sql_file = "select * from file where file_user_name =" +"'" + req.session.user_name +"'" + "and file_pdir =" + Number(req.params.path);
      }

      conn.query(sql_dir, function (err,result0) {
      if (err){
        console.log(err);

      }
      else{
        conn.query(sql_file, function (err,result)
          {
            if (err){
              console.log(err);
            }
            else{
              res.render('index.html', {user_name:req.session.user_name,
                                  folder_list: result0,
                                  file_list:result,
                                  path:req.params.path});
            }
          });
        
        }
      });//conn.query over
    }
  }

  else{//need to login
    res.redirect('/login');
  }
});







var storage = multer.diskStorage({
  destination: function(req,file,cb){
    var path = '/onlinedisk/data/' + req.body.file_md5.substring(0, 2).toUpperCase();
    //console.log('path_upload:' + path);
    cb(null,path);
  },
  filename: function(req,file,cb){
    cb(null,req.body.file_md5);
  }
});

var upload = multer({
  storage: storage
});

router.post('/users/:path', upload.single('new_file'),function(req, res, err) {
  if (req.session.logined){
    var url = '/users/' + req.params.path;


    if (req.file){
      let file_name = req.body.file_name,
              file_user_name = req.session.user_name,
              file_pdir = Number(req.params.path),
              file_creat = moment().format('YYYY-MM-DD HH:mm:ss'),
              data_len = req.file.size;
              file_MD5 = req.body.file_md5;
      if (req.params.path === '0')
        file_pdir = null;
      
      conn.query('insert into file (file_name, file_user_name, file_pdir, file_creat, file_MD5) values (?,?,?,?,?)', [
            file_name, file_user_name, file_pdir, file_creat, file_MD5], function (err){
        if (err){
          console.log(err);
          }
        else{
           conn.query('insert into filedata values (?,?,?,?,?)',[file_MD5, file_creat, file_creat, data_len, 0], function (err){
            if (err) {
              console.log(err);
            }
            else{
              res.redirect(url);
            }
           });
          
        }
            
      });
          
    }

    else if (req.body.rename_folder){
      let new_name = req.body.rename_folder;
      let old_name = req.body.rename_folder_old;
      console.log('rename_folder');
      if (req.params.path === '0')
        conn.query('update dir set dir_name = ? where dir_user_name = ? and dir_pdir is ? and dir_name= ?',[new_name, req.session.user_name, null, old_name], function(err){
          if (err){
            console.log(err);
          }
          res.redirect(url);
        });
      else
        conn.query('update dir set dir_name = ? where dir_user_name = ? and dir_pdir = ? and dir_name= ?',[new_name, req.session.user_name, Number(req.params.path), old_name], function(err){
          res.redirect(url);
        });
      
    }
    
    else if (req.body.rename_file){
      let new_name = req.body.rename_file;
      let old_name = req.body.rename_file_old;
      //console.log(new_name);
      //console.log(old_name);

      if (req.params.path === '0')
        conn.query('update file set file_name = ? where file_user_name = ? and file_pdir is ? and file_name= ?',[new_name, req.session.user_name, null, old_name], function(err){
          res.redirect(url);
        });
      else
        conn.query('update file set file_name = ? where file_user_name = ? and file_pdir = ? and file_name= ?',[new_name, req.session.user_name, Number(req.params.path), old_name],function(err){
          //console.log(req.params.path);
          res.redirect(url);
        });

    }

  }//need to login
  else{
    res.redirect('login');
  }
  

});




router.get('/login', function(req, res, next) {
  res.render('login.html',{error:false} );
});

router.get('/logout', function(req, res, next) {
  req.session.logined = false;
  //conn.query("update user set user_web = 'N' where user_name = ?", [req.session.user_name]);
  res.redirect('/login' );
});

router.post('/login', function(req, res, next) {
  if (req.session.logined)
    res.redirect('/users/0');
  else{
    var user_password = '*' + crypto.createHash('sha1').update(req.body.password,'utf8').digest('hex').toUpperCase();
    var ip = req.headers['X-Real-IP'] || req.connection.remoteAddress;

    ip = ip.substring(ip.lastIndexOf(':')+1);
    console.log(ip);
    conn.query('select * from user where user_name = ?', [req.body.username], function (err,result) {
      if (err){
        console.log(err);

      }
      else if (result.length){//用户名存在
      	console.log(result[0].user_password);
      	console.log(user_password);
      	if (result[0].user_password === user_password ){
        	req.session.logined = true;
        	req.session.user_name = req.body.username;
        	conn.query("update user set user_web = 'Y', user_signup = ? , user_ip = inet_aton(?) where user_name = ?", [moment().format('YYYY-MM-DD HH:mm:ss'), ip, req.body.username], function(err){
          		if (err)
            		console.log(err);
          		res.redirect('/users/0');
        	});
     	}
     	else
     		res.render('login.html',{error:'密码错误'});
      }
      else{
        res.render('login.html',{error:'用户不存在'});
      }
    });

  }//else
});



router.get('/register', function(req, res, next) {
  res.render('register.html', {message: ''});
});



router.post('/register', function(req, res, next) {
  /*
  if (req.body.password != req.body.password-repeat){
    res.render('register.html', {message: '密码不一致'});
  }
  
  else if (Blob(req.body.username).size >32 )
    res.render('register.html', {message: '用户名太长'});
*/
  conn.query('select * from user where user_name = ?', req.body.username, function (err,result) {
    if (err){
      console.log(err);
      return;
    }
    else if (result.length){//用户名已存在
      
      //req.flash('用户名已存在');
      res.render('register.html', {message:'用户名已存在'});
    }

    else{
      var user_password = '*' + crypto.createHash('sha1').update(req.body.password,'utf8').digest('hex').toUpperCase(),
         user_login = moment().format('YYYY-MM-DD HH:mm:ss'),
         user_pc = 'N',
         user_web = 'N',
         user_signup = '1997-01-01 00:00:00',
         user_ip = 0;
      var User=[req.body.username, user_password, user_login, user_pc, user_web, user_signup, user_ip];
      
      //conn.query 1 begin
      conn.query('insert into user values (?,?,?,?,?,?,?)', User, function (err) {
        if (err){
          console.log(err);
          res.redirect('register');
        }
        else{
          res.redirect('login');
        }
      });//conn.query 1 end
    }

  });//conn.query 0 end

});

router.get('/download', function(req, res, next){
  var path = '/onlinedisk/data/' + req.query.file_md5.substring(0, 2) + '/' + req.query.file_md5;
  res.download(path, req.query.file_name, function(err){
    if (err){
      console.log(err);
    }
    conn.query('update filedata set data_count = data_count + 1, data_download = ? where data_MD5 = ?', [moment().format('YYYY-MM-DD HH:mm:ss'), req.query.file_md5], function(err){
      if (err)
        console.log(err);
      
    });
  });
});



module.exports = router;

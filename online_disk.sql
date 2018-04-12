/* 创建数据库 */
drop database if exists onlinedisk;
create database onlinedisk;
use onlinedisk;

/* 创建用户表 */
drop table if exists user;
create table user(
  user_name varchar(16) PRIMARY KEY NOT NULL,
  user_password char(41) NOT NULL,
  user_login datetime NOT NULL,
  user_pc enum("Y", "N") NOT NULL,
  user_web enum("Y", "N") NOT NULL,
  user_signup datetime NOT NULL,
  user_ip int unsigned NOT NULL
) engine=InnoDB DEFAULT CHARSET=gbk;

/* 创建目录表 */
drop table if exists dir;
create table dir(
  dir_id bigint PRIMARY KEY AUTO_INCREMENT NOT NULL,/* 目录编号，主键，自动增长 */
  dir_name varchar(255) NOT NULL,                   /* 目录名，最多256个字节    */
  dir_user_name varchar(16) NOT NULL,               /* 所属用户名               */
  dir_pdir bigint,                                  /* 上级目录编号             */
  FOREIGN KEY (dir_user_name) REFERENCES user(user_name)/* 外键 */
    ON DELETE CASCADE /* 级联删除 */
    ON UPDATE CASCADE,/* 级联更新 */
  FOREIGN KEY (dir_pdir) REFERENCES dir(dir_id)/* 外键 */
    ON DELETE CASCADE /* 级联删除 */
) engine=InnoDB DEFAULT CHARSET=gbk;

/* 创建文件表 */
drop table if exists file;
create table file(
  file_id bigint PRIMARY KEY AUTO_INCREMENT NOT NULL,/* 文件编号，主键，自动增长 */
  file_name varchar(255) NOT NULL,                   /* 文件名，最多256个字节    */
  file_user_name varchar(16) NOT NULL,               /* 所属用户名               */
  file_pdir bigint,                                  /* 上级目录编号             */
  file_creat datetime NOT NULL,                      /* 创建时间                 */
  file_MD5 char(32) NOT NULL,                        /* 文件MD5值                */
  FOREIGN KEY (file_user_name) REFERENCES user(user_name)/* 外键 */
    ON DELETE CASCADE /* 级联删除 */
    ON UPDATE CASCADE,/* 级联更新 */
  FOREIGN KEY (file_pdir) REFERENCES dir(dir_id)/* 外键 */
    ON DELETE CASCADE /* 级联删除 */
) engine=InnoDB DEFAULT CHARSET=gbk;

/* 创建文件数据表并插入0字节文件项 */
drop table if exists filedata;
create table filedata (
  data_MD5 char(32) PRIMARY KEY NOT NULL,/* 文件md5值        */
  data_upload datetime NOT NULL,         /* 上传时间         */
  data_download datetime NOT NULL,       /* 最后一次下载时间 */
  data_len bigint NOT NULL,              /* 文件长度         */
  data_count int NOT NULL DEFAULT 0      /* 文件下载次数     */
) engine=InnoDB DEFAULT CHARSET=gbk;
insert into filedata values("D41D8CD98F00B204E9800998ECF8427E", "1970-01-01 00:00:00", "1970-01-01 00:00:00", 0, 0);

/* 创建临时文件表 */
drop table if exists filetemp;
create table filetemp(
  temp_MD5 char(32) PRIMARY KEY NOT NULL,/* 文件md5值            */
  temp_time datetime NOT NULL,           /* 最后一次上传时间     */
  temp_ip int unsigned NOT NULL,         /* 负责上传的进程的地址 */
  temp_port smallint unsigned NOT NULL   /* 负责上传的进程的端口 */
) engine=InnoDB DEFAULT CHARSET=gbk;

/* 创建用户并授予权限 */
/*grant all privileges on onlinedisk.* to 'server'@'%' identified by '***';   */
grant all privileges on onlinedisk.* to 'server'@'localhost' identified by '***';

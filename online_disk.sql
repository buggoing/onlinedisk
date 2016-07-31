/* �������ݿ� */
drop database if exists onlinedisk;
create database onlinedisk;
use onlinedisk;

/* �����û��� */
drop table if exists user;
create table user(
  user_name varchar(16) PRIMARY KEY NOT NULL,/* �û��������32���ֽ�           */
  user_password char(41) NOT NULL,           /* ���룬�������뾭SHA1���ܺ��ֵ */
  user_login datetime NOT NULL,              /* ע��ʱ�䣬YYYY-MM-DD HH:MM:SS  */
  user_pc enum("Y", "N") NOT NULL,           /* pc���Ƿ��¼                   */
  user_web enum("Y", "N") NOT NULL,          /* web���Ƿ��¼                  */
  user_signup datetime NOT NULL,             /* ���һ�ε�¼ʱ��               */
  user_ip int unsigned NOT NULL              /* ���һ�ε�¼ip                 */
) engine=InnoDB DEFAULT CHARSET=gbk;

/* ����Ŀ¼�� */
drop table if exists dir;
create table dir(
  dir_id bigint PRIMARY KEY AUTO_INCREMENT NOT NULL,/* Ŀ¼��ţ��������Զ����� */
  dir_name varchar(255) NOT NULL,                   /* Ŀ¼�������256���ֽ�    */
  dir_user_name varchar(16) NOT NULL,               /* �����û���               */
  dir_pdir bigint,                                  /* �ϼ�Ŀ¼���             */
  FOREIGN KEY (dir_user_name) REFERENCES user(user_name)/* ��� */
    ON DELETE CASCADE /* ����ɾ�� */
    ON UPDATE CASCADE,/* �������� */
  FOREIGN KEY (dir_pdir) REFERENCES dir(dir_id)/* ��� */
    ON DELETE CASCADE /* ����ɾ�� */
) engine=InnoDB DEFAULT CHARSET=gbk;

/* �����ļ��� */
drop table if exists file;
create table file(
  file_id bigint PRIMARY KEY AUTO_INCREMENT NOT NULL,/* �ļ���ţ��������Զ����� */
  file_name varchar(255) NOT NULL,                   /* �ļ��������256���ֽ�    */
  file_user_name varchar(16) NOT NULL,               /* �����û���               */
  file_pdir bigint,                                  /* �ϼ�Ŀ¼���             */
  file_creat datetime NOT NULL,                      /* ����ʱ��                 */
  file_MD5 char(32) NOT NULL,                        /* �ļ�MD5ֵ                */
  FOREIGN KEY (file_user_name) REFERENCES user(user_name)/* ��� */
    ON DELETE CASCADE /* ����ɾ�� */
    ON UPDATE CASCADE,/* �������� */
  FOREIGN KEY (file_pdir) REFERENCES dir(dir_id)/* ��� */
    ON DELETE CASCADE /* ����ɾ�� */
) engine=InnoDB DEFAULT CHARSET=gbk;

/* �����ļ����ݱ�����0�ֽ��ļ��� */
drop table if exists filedata;
create table filedata (
  data_MD5 char(32) PRIMARY KEY NOT NULL,/* �ļ�md5ֵ        */
  data_upload datetime NOT NULL,         /* �ϴ�ʱ��         */
  data_download datetime NOT NULL,       /* ���һ������ʱ�� */
  data_len bigint NOT NULL,              /* �ļ�����         */
  data_count int NOT NULL DEFAULT 0      /* �ļ����ش���     */
) engine=InnoDB DEFAULT CHARSET=gbk;
insert into filedata values("D41D8CD98F00B204E9800998ECF8427E", "1970-01-01 00:00:00", "1970-01-01 00:00:00", 0, 0);

/* ������ʱ�ļ��� */
drop table if exists filetemp;
create table filetemp(
  temp_MD5 char(32) PRIMARY KEY NOT NULL,/* �ļ�md5ֵ            */
  temp_time datetime NOT NULL,           /* ���һ���ϴ�ʱ��     */
  temp_ip int unsigned NOT NULL,         /* �����ϴ��Ľ��̵ĵ�ַ */
  temp_port smallint unsigned NOT NULL   /* �����ϴ��Ľ��̵Ķ˿� */
) engine=InnoDB DEFAULT CHARSET=gbk;


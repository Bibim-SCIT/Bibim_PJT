CREATE TABLE 'workspace' (
    'ws_id' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'ws_name' VARCHAR(255) NOT NULL,
    'ws_img' VARCHAR(255) NOT NULL,
    'reg_date' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE 'member' (
    'email' VARCHAR(50) PRIMARY KEY,
    'password' VARCHAR(255) NOT NULL,
    'roles' BOOLEAN NOT NULL DEFAULT 0,
    'name' VARCHAR(255) NOT NULL,
    'nationality' VARCHAR(255) NOT NULL,
    'language' VARCHAR(20) NOT NULL DEFAULT 'english',
    'profile_image' VARCHAR(255) NULL,
    'login_status' CHAR(1) NOT NULL,
    'auth' BOOLEAN NOT NULL,
    'social_login_check' VARCHAR(255) NOT NULL,
    'reg_date' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE 'record' (
    'record_number' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'ws_id' BIGINT NOT NULL,
    'title' VARCHAR(255) NOT NULL DEFAULT '회의 기록',
    'context' VARCHAR(255) NOT NULL,
    'reg_date' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    'ai_yn' BOOLEAN NOT NULL,
    FOREIGN KEY ('ws_id') REFERENCES 'workspace'('ws_id')
);

CREATE TABLE 'workspace_role' (
	'ch_role_number' BIGINT PRIMARY KEY AUTO_INCREMENT,
    'ws_id' BIGINT NOT NULL,
    'ch_role' VARCHAR(255) NOT NULL,
    FOREIGN KEY ('ws_id') REFERENCES 'workspace'('ws_id')
);

CREATE TABLE 'workspace_member' (
	'm_ws_number' BIGINT PRIMARY KEY AUTO_INCREMENT,
    'ws_id' BIGINT NOT NULL,
    'email' VARCHAR(50) NOT NULL,
    'ws_role' VARCHAR(255) NOT NULL,
    'ch_role_number' BIGINT NOT NULL,
    'nickname' VARCHAR(255) NOT NULL,
    'profile_image' VARCHAR(255) NOT NULL,
    FOREIGN KEY ('ws_id') REFERENCES 'workspace'('ws_id'),
    FOREIGN KEY ('email') REFERENCES 'member'('email'),
    FOREIGN KEY ('ch_role_number') REFERENCES 'workspace_role'('ch_role_number')
);



CREATE TABLE 'schedule' (
	'schedule_number' BIGINT PRIMARY KEY AUTO_INCREMENT,
    'email' VARCHAR(50) NOT NULL,
    'ws_id' BIGINT NOT NULL,
    'schedule_title' VARCHAR(255) NOT NULL,
    'schedule_content' VARCHAR(255) NOT NULL,
    'schedule_status' CHAR(10) NOT NULL,
    'schedule_uptime' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    'schedule_modifytime' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    'schedule_startdate' DATETIME NOT NULL,
    'schedule_finishdate' DATETIME NOT NULL,
    FOREIGN KEY ('email') REFERENCES 'member'('email'),
    FOREIGN KEY ('ws_id') REFERENCES 'workspace'('ws_id')
);


CREATE TABLE 'workspace_channel' (
	'channel_number' BIGINT PRIMARY KEY AUTO_INCREMENT,
    'ch_role_number' BIGINT NOT NULL,
    'ws_id' BIGINT NOT NULL,
    'channel_name' VARCHAR(255) NOT NULL,
    FOREIGN KEY ('ch_role_number') REFERENCES 'workspace_role'('ch_role_number'),
    FOREIGN KEY ('ws_id') REFERENCES 'workspace'('ws_id')
);

CREATE TABLE 'tag' (
	'tag_number' BIGINT PRIMARY KEY AUTO_INCREMENT,
    'schedule_number' BIGINT NOT NULL,
    'tag_1' VARCHAR(255) NULL,
    'tag_2' VARCHAR(255) NULL,
    'tag_3' VARCHAR(255) NULL,
    'tag_color' VARCHAR(255) NOT NULL,
    FOREIGN KEY ('schedule_number') REFERENCES 'schedule'('schedule_number')
);

CREATE TABLE 'notice' (
	'notice_number' BIGINT PRIMARY KEY AUTO_INCREMENT,
    'schedule_number' BIGINT NOT NULL,
    'record_number' BIGINT NOT NULL,
    'notice_name' VARCHAR(255) NOT NULL,
    'notice_type' VARCHAR(255) NOT NULL,
    'notice_status' BOOLEAN NOT NULL,
    'notice_content' VARCHAR(255) NULL,
    'notice_date' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ('schedule_number') REFERENCES 'schedule'('schedule_number'),
    FOREIGN KEY ('record_number') REFERENCES 'record'('record_number')
);

CREATE TABLE 'workspace_channel_message' (
	'ch_number' BIGINT PRIMARY KEY AUTO_INCREMENT,
    'channel_number' BIGINT NOT NULL,
    'sender' VARCHAR(50) NOT NULL,
    'ch_content' VARCHAR(255) NOT NULL,
    'send_time' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ('channel_number') REFERENCES 'workspace_channel'('channel_number'),
    FOREIGN KEY ('sender') REFERENCES 'member'('email')
);

CREATE TABLE 'workspace_channel_file' (
    'file_number' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'ch_number' BIGINT NOT NULL,
    'file' VARCHAR(255) NOT NULL,
    'file_name' VARCHAR(255) NOT NULL,
    FOREIGN KEY ('ch_number') REFERENCES 'workspace_channel'('channel_number')
);

CREATE TABLE 'workdata' (
    'data_number' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'ws_id' BIGINT NOT NULL,
    'writer' VARCHAR(255) NOT NULL,
    'title' VARCHAR(255) NOT NULL,
    'content' VARCHAR(255) NULL,
    'reg_date' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ('ws_id') REFERENCES 'workspace'('ws_id'),
    FOREIGN KEY ('writer') REFERENCES 'member'('email')
);

CREATE TABLE 'workdatafile' (
    'file_number' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'data_number' BIGINT NOT NULL,
    'file' VARCHAR(255) NOT NULL,
    'file_name' VARCHAR(255) NOT NULL,
    FOREIGN KEY ('data_number') REFERENCES 'workdata'('data_number')
);

CREATE TABLE 'workdatafiletag' (
    'file_tag_number' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'file_number' BIGINT NOT NULL,
    'tag' VARCHAR(255) NULL,
    FOREIGN KEY ('file_number') REFERENCES 'workdatafile'('file_number')
);

CREATE TABLE 'dm' (
    'dm_number' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'ws_id' BIGINT NOT NULL,
    'sender' VARCHAR(50) NOT NULL,
    'receiver' VARCHAR(50) NOT NULL,
    'dm_content' VARCHAR(255) NOT NULL,
    'send_time' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ('ws_id') REFERENCES 'workspace'('ws_id'),
    FOREIGN KEY ('sender') REFERENCES 'member'('email'),
    FOREIGN KEY ('receiver') REFERENCES 'member'('email')
);

CREATE TABLE 'dmfile' (
    'file_number' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'dm_number' BIGINT NOT NULL,
    'file' VARCHAR(255) NOT NULL,
    'file_name' VARCHAR(255) NOT NULL,
    FOREIGN KEY ('dm_number') REFERENCES 'dm'('dm_number')
);

CREATE TABLE 'recordfile' (
    'file_number' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'record_number' BIGINT NOT NULL,
    'file' VARCHAR(255) NOT NULL,
    'file_name' VARCHAR(255) NOT NULL,
    FOREIGN KEY ('record_number') REFERENCES 'record'('record_number')
);
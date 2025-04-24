/*
 Navicat Premium Data Transfer

 Source Server         : server
 Source Server Type    : MySQL
 Source Server Version : 90300 (9.3.0)
 Source Host           : localhost:3306
 Source Schema         : my-koa

 Target Server Type    : MySQL
 Target Server Version : 90300 (9.3.0)
 File Encoding         : 65001

 Date: 24/04/2025 14:08:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_dict_data
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_data`;
CREATE TABLE `sys_dict_data`  (
  `dict_code` bigint NOT NULL AUTO_INCREMENT COMMENT '字典编码',
  `dict_sort` int NULL DEFAULT 0 COMMENT '字典排序',
  `dict_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '字典标签',
  `dict_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '字典键值',
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '字典类型',
  `css_class` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '样式属性（其他样式扩展）',
  `list_class` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '表格回显样式',
  `is_default` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'N' COMMENT '是否默认（Y是 N否）',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`dict_code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 120 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '字典数据表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_dict_data
-- ----------------------------
INSERT INTO `sys_dict_data` VALUES (104, 1, '测试', '013', 'sys_test3', NULL, NULL, 'N', '0', '', '2024-11-11 10:13:50', '', '2024-11-11 10:43:25', '测试');
INSERT INTO `sys_dict_data` VALUES (106, 1, '男', '0', 'sys_sex', NULL, NULL, 'N', '0', '', '2024-11-11 11:16:35', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (107, 1, '女', '1', 'sys_sex', NULL, NULL, 'N', '0', '', '2024-11-11 11:16:40', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (108, 1, '未知', '2', 'sys_sex', NULL, NULL, 'N', '0', '', '2024-11-11 11:16:48', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (109, 1, '正常', '0', 'sys_status', NULL, NULL, 'N', '0', '', '2024-11-11 15:24:33', '', '2024-11-11 16:02:30', 'success');
INSERT INTO `sys_dict_data` VALUES (110, 1, '禁用', '1', 'sys_status', NULL, NULL, 'N', '0', '', '2024-11-11 15:24:45', '', '2024-11-11 16:02:41', 'danger');
INSERT INTO `sys_dict_data` VALUES (111, 1, '目录', 'M', 'sys_menu_type', NULL, NULL, 'N', '0', '', '2024-11-11 16:35:19', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (112, 1, '菜单', 'C', 'sys_menu_type', NULL, NULL, 'N', '0', '', '2024-11-11 16:35:27', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (113, 1, '显示', '0', 'sys_menu_visible', NULL, NULL, 'N', '0', '', '2024-11-11 16:38:49', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (114, 1, '隐藏', '1', 'sys_menu_visible', NULL, NULL, 'N', '0', '', '2024-11-11 16:39:06', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (115, 1, '缓存', '0', 'sys_menu_is_cache', NULL, NULL, 'N', '0', '', '2024-11-11 16:40:22', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (116, 1, '不缓存', '1', 'sys_menu_is_cache', NULL, NULL, 'N', '0', '', '2024-11-11 16:40:29', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (117, 1, '超级管理员', 'admin', 'sys_role', NULL, NULL, 'N', '0', '', '2024-11-11 16:47:09', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (118, 1, '普通角色', 'common', 'sys_role', NULL, NULL, 'N', '0', '', '2024-11-11 16:47:50', '', NULL, '');
INSERT INTO `sys_dict_data` VALUES (119, 0, '测试角色', 'test', 'sys_role', NULL, NULL, 'N', '0', '', '2024-11-11 17:13:20', '', NULL, NULL);

-- ----------------------------
-- Table structure for sys_dict_type
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_type`;
CREATE TABLE `sys_dict_type`  (
  `dict_id` bigint NOT NULL AUTO_INCREMENT COMMENT '字典主键',
  `dict_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '字典名称',
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '字典类型',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`dict_id`) USING BTREE,
  UNIQUE INDEX `dict_type`(`dict_type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 126 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '字典类型表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_dict_type
-- ----------------------------
INSERT INTO `sys_dict_type` VALUES (119, '用户性别', 'sys_sex', '0', '', '2024-11-11 11:16:22', '', '2024-11-11 16:35:01', '系统用户性别');
INSERT INTO `sys_dict_type` VALUES (120, '状态', 'sys_status', '0', '', '2024-11-11 15:23:57', '', '2024-11-11 16:34:47', '系统状态');
INSERT INTO `sys_dict_type` VALUES (121, '菜单类型', 'sys_menu_type', '0', '', '2024-11-11 16:34:40', '', NULL, '系统菜单');
INSERT INTO `sys_dict_type` VALUES (122, '菜单显示', 'sys_menu_visible', '0', '', '2024-11-11 16:38:34', '', '2024-11-11 16:40:01', '');
INSERT INTO `sys_dict_type` VALUES (123, '菜单缓存', 'sys_menu_is_cache', '0', '', '2024-11-11 16:39:55', '', NULL, '');
INSERT INTO `sys_dict_type` VALUES (124, '角色', 'sys_role', '0', '', '2024-11-11 16:46:43', '', NULL, '');
INSERT INTO `sys_dict_type` VALUES (125, '测试', 'test', '0', '', '2024-11-11 17:28:00', '', NULL, '');

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu`  (
  `menu_id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `menu_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '菜单名称',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父菜单ID',
  `order_num` int NULL DEFAULT 0 COMMENT '显示顺序',
  `path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '路由地址',
  `component` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '组件路径',
  `query` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '路由参数',
  `route_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '路由名称',
  `is_frame` int NULL DEFAULT 1 COMMENT '是否为外链（0是 1否）',
  `is_cache` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '是否缓存（0缓存 1不缓存）',
  `menu_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '菜单类型（M目录 C菜单 F按钮）',
  `visible` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '菜单状态（0显示 1隐藏）',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '菜单状态（0正常 1停用）',
  `perms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '权限标识',
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '菜单图标',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '备注',
  `del_flag` int NULL DEFAULT 0 COMMENT '删除标志（0代表存在 2代表删除）',
  `module_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '所属模块',
  PRIMARY KEY (`menu_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2054 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '菜单权限表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
INSERT INTO `sys_menu` VALUES (2038, '系统管理', 0, 2, '/sys', '/sys', NULL, '', 1, '0', 'M', '0', '0', NULL, 'system', 'admin', '2024-11-04 09:28:50', '', '2025-04-24 11:41:10', '', 0, 'backManagement');
INSERT INTO `sys_menu` VALUES (2039, '字典管理', 2038, 3, '/sys/dict', '/sys/dict/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'dict', 'admin', '2024-11-05 09:28:56', '', '2025-04-24 13:45:48', '', 0, 'backManagement');
INSERT INTO `sys_menu` VALUES (2040, '菜单管理', 2038, 4, '/sys/route', '/sys/route/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'tree-table', 'admin', '2024-11-05 09:29:00', '', '2025-04-24 13:45:57', '', 0, 'backManagement');
INSERT INTO `sys_menu` VALUES (2041, '角色管理', 2038, 2, '/sys/role', '/sys/role/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'peoples', 'admin', '2024-11-05 10:13:51', '', '2025-04-24 13:45:44', '', 0, 'backManagement');
INSERT INTO `sys_menu` VALUES (2042, '首页', 0, 1, '/index', '/index', NULL, '', 1, '0', 'M', '0', '0', NULL, 'dashboard', 'admin', '2024-11-05 21:00:44', '', '2024-11-05 21:04:51', '', 0, '默认模块');
INSERT INTO `sys_menu` VALUES (2044, '用户管理', 2038, 1, '/sys/user', '/sys/user/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'user', 'admin', '2024-11-07 11:05:47', '', '2025-04-24 13:45:38', '', 0, 'backManagement');
INSERT INTO `sys_menu` VALUES (2045, '字典数据', 2038, 3, '/dict/value', '/sys/dict/value', NULL, '', 1, '1', 'C', '1', '0', NULL, 'list', 'admin', '2024-11-09 21:35:30', '', '2025-04-24 13:45:52', '', 0, 'backManagement');
INSERT INTO `sys_menu` VALUES (2046, '首页大屏', 0, 1, '/index', '/index', NULL, '', 1, '0', 'M', '0', '0', NULL, 'monitor', 'admin', '2025-04-24 13:47:08', '', NULL, '', 0, 'index');
INSERT INTO `sys_menu` VALUES (2047, '工具模块', 0, 3, '/tools/wordCloud', '/tools/wordCloud', NULL, '', 1, '0', 'M', '0', '0', NULL, 'component', 'admin', '2025-04-24 13:47:55', '', NULL, '', 0, 'tools');
INSERT INTO `sys_menu` VALUES (2048, '数字人', 2047, 3, '/tools/digitalMan', '/tools/digitalMan/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'people', 'admin', '2025-04-24 13:49:38', '', '2025-04-24 13:57:11', '', 0, 'tools');
INSERT INTO `sys_menu` VALUES (2049, '词云图', 2047, 1, '/tools/wordCloud', '/tools/wordCloud/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'dict', 'admin', '2025-04-24 13:52:55', '', '2025-04-24 13:55:11', '', 0, 'tools');
INSERT INTO `sys_menu` VALUES (2050, '文件对比', 2047, 2, '/tools/fileCompare', '/tools/fileCompare/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'documentation', 'admin', '2025-04-24 13:56:53', '', '2025-04-24 13:57:14', '', 0, 'tools');
INSERT INTO `sys_menu` VALUES (2051, '3D模型模块', 0, 4, '/threeModel', '/threeModel', NULL, '', 1, '0', 'M', '0', '0', NULL, 'redis', 'admin', '2025-04-24 13:58:57', '', '2025-04-24 14:00:26', '', 0, 'threeModel');
INSERT INTO `sys_menu` VALUES (2052, '机房模型', 2051, 1, '/threeModel/machineRoom', '/threeModel/machineRoom/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'druid', 'admin', '2025-04-24 14:00:07', '', NULL, '', 0, 'threeModel');
INSERT INTO `sys_menu` VALUES (2053, '汽车拆解', 2051, 2, '/threeModel/explode', '/threeModel/explode/index', NULL, '', 1, '0', 'C', '0', '0', NULL, 'nested', 'admin', '2025-04-24 14:01:24', '', NULL, '', 0, 'threeModel');

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role`  (
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色名称',
  `role_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色权限字符串',
  `role_sort` int NOT NULL COMMENT '显示顺序',
  `data_scope` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '1' COMMENT '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限）',
  `menu_check_strictly` tinyint(1) NULL DEFAULT 1 COMMENT '菜单树选择项是否关联显示',
  `dept_check_strictly` tinyint(1) NULL DEFAULT 1 COMMENT '部门树选择项是否关联显示',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`role_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 105 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_role
-- ----------------------------
INSERT INTO `sys_role` VALUES (1, '超级管理员', 'admin', 1, '1', 1, 1, '0', '0', 'admin', '2024-09-28 00:04:20', '', NULL, '超级管理员');
INSERT INTO `sys_role` VALUES (2, '普通角色', 'common', 2, '2', 1, 1, '0', '0', 'admin', '2024-09-28 00:04:20', 'admin', '2024-11-05 21:06:49', '普通角色');
INSERT INTO `sys_role` VALUES (103, '测试角色', 'test1', 1, '1', 1, 1, '0', '2', 'admin', '2024-11-05 16:08:41', '', '2024-11-05 17:13:21', '备注');
INSERT INTO `sys_role` VALUES (104, '测试角色', 'test', 1, '1', 1, 1, '0', '0', 'admin', '2024-11-11 17:13:20', '', NULL, NULL);

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu`  (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `menu_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '菜单ID',
  PRIMARY KEY (`role_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色和菜单关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------
INSERT INTO `sys_role_menu` VALUES (2, '2042,2041,2040');
INSERT INTO `sys_role_menu` VALUES (104, '2042');

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `dept_id` bigint NULL DEFAULT NULL COMMENT '部门ID',
  `user_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户账号',
  `nick_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户昵称',
  `user_type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '00' COMMENT '用户类型（00系统用户）',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '用户邮箱',
  `phonenumber` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '手机号码',
  `sex` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '用户性别（0男 1女 2未知）',
  `avatar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '头像地址',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '密码',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '帐号状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `login_ip` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '最后登录IP',
  `login_date` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `role_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户角色',
  `login_os` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '登录系统信息',
  `login_browser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '浏览器信息',
  `login_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '登录地址信息',
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 105 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (103, NULL, 'admin', 'admin', '00', 'KTechArtAdmin@qq.com', '18888888888', '0', 'upload/sys/avater.gif', 'e2fa05602ce8a0b1e9d7527bab3b4e7a:8a098e1790eaa95f03a6e49da28e4106', '0', '0', '127.0.0.1', '2024-12-25 15:34:53', '', '2024-10-30 16:06:04', 'admin', '2024-12-25 15:53:10', 'admin', 'admin', 'Mac OS X 10.15.7', 'Chrome 131.0.0', '未知国家,未知省份,未知城市');
INSERT INTO `sys_user` VALUES (104, NULL, '测试', '测试1', '00', '124@qq.com', '16666666666', '0', 'upload/sys/avater.gif', 'b238243840b30ade6e4523262507e63e:faa65f28239da897d48b5cb6bd7c5afd', '0', '0', '127.0.0.1', '2024-11-07 16:32:47', 'admin', '2024-11-07 15:57:00', 'admin', '2024-12-16 09:44:53', NULL, 'common', 'Mac OS X 10.15.7', 'Chrome 130.0.0', '未知国家,未知省份,未知城市');

SET FOREIGN_KEY_CHECKS = 1;

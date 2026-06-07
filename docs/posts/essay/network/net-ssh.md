---
title: "SSH 与 VSFTPD 拒绝服务"
category: "随笔"
subCategory: "NetWork"
subSubCategory: ""
---


## 1. 故障背景与现象

- **触发原因**：意外执行了针对根目录及所有子目录的权限放宽命令（如 `sudo chmod -R 777 /`），导致系统全局文件权限失去安全控制。
- **故障现象**：
    1. **SSH 拒绝连接**：尝试通过 SSH 登录时连接被重置，系统控制台测试 `sshd -t` 提示主机私钥权限过于开放（`Permissions 0777 are too open`），以及缺失权限隔离目录（`Missing privilege separation directory`）。
    2. **VSFTPD 认证失败**：FTP 客户端可建立连接，但输入正确密码后返回 `530 Login incorrect`。查阅 `/var/log/auth.log` 发现 PAM 模块因 `/etc/ftpusers` 和 `/etc/shells` 权限不安全而强制阻断认证。

## 2. 根本原因分析


Linux 系统中的核心网络服务（SSHD、VSFTPD）及身份验证模块（PAM）内置了严格的防御机制。当检测到其依赖的配置文件、密钥文件或目录对非特权用户开放写入权限时，为防止提权或中间人攻击，服务会主动阻断运行或拒绝处理身份验证请求。


## 3. 修复方案与操作步骤


### 3.1 SSHD 服务恢复操作


需重建 SSH 运行所需的严格权限环境。

1. **修复主机密钥权限**：
私钥必须仅 root 可读写（`600`），公钥可全局读（`644`）。Bash

    ```bash
    sudo chown root:root /etc/ssh/ssh_host_*
    sudo chmod 600 /etc/ssh/ssh_host_*_key
    sudo chmod 644 /etc/ssh/ssh_host_*_key.pub
    ```

2. **重建 SSH 权限隔离目录**：
该目录必须由 root 拥有且拒绝其他组的写入权限（`755`）。Bash

    ```bash
    sudo mkdir -p /run/sshd
    sudo chown root:root /run/sshd
    sudo chmod 755 /run/sshd
    ```

3. **验证并重启服务**：Bash

    ```bash
    sudo sshd -t
    sudo systemctl restart sshd
    ```


### 3.2 VSFTPD 与 PAM 认证恢复操作


需恢复 FTP 服务隔离环境及 PAM 鉴权所依赖的核心文件权限。

1. **修复 VSFTPD 配置文件与隔离目录**：Bash

    ```bash
    sudo chown root:root /etc/vsftpd.conf
    sudo chmod 644 /etc/vsftpd.conf
    sudo mkdir -p /var/run/vsftpd/empty
    sudo chown root:root /var/run/vsftpd/empty
    sudo chmod 755 /var/run/vsftpd/empty
    ```

2. **修复系统核心鉴权文件与安全名单权限**：
PAM 强依赖这四个文件的权限完整性，必须收回写入权限。Bash

    ```bash
    sudo chown root:root /etc/ftpusers /etc/shells /etc/passwd
    sudo chmod 644 /etc/ftpusers /etc/shells /etc/passwd
    sudo chown root:shadow /etc/shadow
    sudo chmod 640 /etc/shadow
    ```

3. **修复 FTP 登录用户家目录权限**：
VSFTPD 默认禁止向具有全局可写权限的家目录提供服务。Bash

    ```bash
    # 以用户 lewuq 为例
    sudo chmod 755 /home/lewuq
    ```

4. **重启服务**：Bash

    ```bash
    sudo systemctl restart vsftpd
    ```


## 4. 后续风险评估与建议


当前的修复操作仅针对 SSH 与 VSFTPD 进行了定向定点恢复，满足了基础的远程运维与文件传输需求。但全局 `chmod -R` 导致的潜在权限破坏（如 `SUID/SGID` 标志位丢失、数据库运行目录权限异常等）仍然存在。


**工程建议**：当前系统环境应定义为“受损/亚健康状态”。建议利用已恢复的 SSH/SFTP/FTP 通道，尽快将工作目录、项目代码及重要数据导出备份，随后重新部署底层操作系统，以消除未知的安全及运行隐患。


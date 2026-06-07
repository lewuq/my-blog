---
title: "部署在树莓派的HA OS 配置无线网卡"
category: "随笔"
subCategory: "HomeAssistant"
subSubCategory: ""
---


前提：你没有网线接口和路由


首先你要有以下物料：

- 一根适配于树莓派4B或者5B的的HDMI线，
- 一个部署了HA OS的树莓派
- 给树莓派供电的电源
- 一个键盘（用来敲命令行~）
- 一个屏幕

然后等待初始化完成

- 输入 net / network 命令进行查看所有命令，我比较喜欢用 net

    ```bash
    net
    ```

- 接着会打印一些帮助命令，这里主要关注于 ipv4 和 ipv6 以及 wifi 的一些配置，这些才是我们主要使用的

    ```bash
    Usage:
      ha network update [interface] [flags]
    
    Examples:
      ha network update eth0 --ipv4-method auto
      ha network update wlan0 --ipv4-method static --address 192.168.1.10/24 --gateway 192.168.1.1 --dns 8.8.8.8
    
    Flags:
          --address strings      A list of IPv4/IPv6 addresses (CIDR notation)
          --dns strings          A list of DNS servers
          --gateway string       The gateway address
      -h, --help                 help for update
          --ipv4-method string   Method to use for IPv4 (static|auto|disabled)
          --ipv6-method string   Method to use for IPv6 (static|auto|disabled)
          --wifi-auth string     WiFi authentication method (wpa-psk|wep|open)
          --wifi-mode string     WiFi mode (infrastructure|mesh|adhoc)
          --wifi-psk string      WiFi password
          --wifi-ssid string     WiFi SSID
    ```

- 配置 wifi 网卡

    ```bash
    net update wlan0 \
    				--ipv4-method auto \
    				--ipv6-method auto \
    				--wifi-auth wpa-psk \
    				--wifi-mode infrastructure \
    				--wifi-ssid Your-WiFi-Name \
    				--wifi-psk Your-WiFi-Password
    ```


    然后等待连接，成功之后会显示：Command completed sucessfully !

- 查看 ip 地址

    ```bash
    net info
    ```


    接着会打印对应的ip地址的信息，主要关注 IPv4 的地址，那个为大多数网络所使用的协议
    然后等待在你的电脑上输入这个IPV4 地址，静待 HA 初始化完成，即可开启智能家居之旅~


    ```bash
    docker:
      interface: docker0
      address: 172.30.32.0/23
      gateway: 172.30.32.1
      dns: 172.30.32.3
    host_internet: true
    interfaces:
    - connected: true
      enabled: true
      interface: eth0
      ipv4:
        address:
        - 192.168.1.100/24
        gateway: 192.168.1.1
        method: auto
        nameservers:
        - 192.168.1.1
      ipv6:
        address: []
        gateway: null
        method: disabled
        nameservers: []
      mac: DC:A6:32:XX:XX:XX
      primary: true
      type: ethernet
      vlan: null
      wifi: null
    - connected: true
      enabled: true
      interface: wlan0
      ipv4:
        address:
        - 192.168.1.101/24
        gateway: 192.168.1.1
        method: auto
        nameservers:
        - 8.8.8.8
        - 1.1.1.1
      ipv6:
        address: []
        gateway: null
        method: disabled
        nameservers: []
      mac: DC:A6:32:YY:YY:YY
      primary: false
      type: wireless
      vlan: null
      wifi:
        auth: wpa-psk
        mode: infrastructure
        signal: 78
        ssid: YOUR_WIFI_NAME
    - connected: true
      enabled: true
      interface: hassio
      ipv4:
        address:
        - 172.30.32.1/23
        gateway: null
        method: manual
        nameservers: []
      ipv6:
        address: []
        gateway: null
        method: disabled
        nameservers: []
      mac: 02:42:AC:XX:XX:XX
      primary: false
      type: bridge
      vlan: null
      wifi: null
    ```


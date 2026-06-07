---
title: "主频和时钟配置"
category: "Linux"
subCategory: "linux-bare"
subSubCategory: "i.MX6ULL"
---

# 主频和时钟配置


时钟解析


想要发挥一块 Linux 开发板的性能，需要配置对应的时钟，IMX6U 的系统主频为 528MHz，默认情况下内部 boot rom 设置为 396 MHz 


## 新建文件夹 和 修改 bsp_clk 的内容

- 新建文件夹

```shell
# 复制上一节的文件夹
cp -rf 7_ledc_key 8_clk

# 修改工作区
cd 8_clk/
mv 7_ledc_key.code-workspace 8_clk.code-workspace
```

- 修改 clk 文件夹的内容
<details>
<summary>bsp_clk.h</summary>

```c
#ifndef _BSP_CLK_H
#define _BSP_CLK_H

#include "imx6ul.h"
void clk_enable(void);
void imx6u_clkinit(void);
#endif
```


</details>

<details>
<summary>bsp_clk.c</summary>

```c
#include "bsp_clk.h"

void clk_enable(void){

    CCM->CCGR0 = 0xffffffff;
    CCM->CCGR1 = 0xffffffff;
    CCM->CCGR2 = 0xffffffff;
    CCM->CCGR3 = 0xffffffff;
    CCM->CCGR4 = 0xffffffff;
    CCM->CCGR5 = 0xffffffff;
    CCM->CCGR6 = 0xffffffff;
}

void imx6u_clkinit( void ){

    unsigned int reg  = 0 ;
    /**
     * 1 设置 ARM 内核时钟为 528 MHz 
     * 1.1 判断启动时钟源，正常情况下由 plll_sw_clk 驱动
     *     pll_sw_clk 来源： pll_main_clk 、step_clk
     *     I.MX68LL up to 528 MHz -> 选择 pll_main_clk 
     *     若需要修改 pll_main_clk 先要将 pll_sw_clk 从 pll_main_clk 切换至 step_clk
     *     当修改完后再将 pll_sw_clk 切换回 pll_main_clk，step_clk 相当于 24MHz   
     */
    if( ( (( CCM->CCSR ) >> 2 ) & 0x1 ) == 0 ){ /* pll1_main_clk */
        CCM->CCSR &= ~( 1 << 8 );               /* 配置 step_clk 时钟源为 24MHz OSC */
        CCM->CCSR |= ( 1 << 2 );                /* 配置 step_clk 时钟源为 24MHz OSC */

    }

    /***
     * 1.2、设置 pll1_main_clk 为 1056MHz,也就是 528*2=1056MHZ,
     *      因为 pll1_sw_clk 进 ARM 内核的时候会被二分频！
     *      配置 CCM_ANLOG->PLL_ARM 寄存器
     *      bit13: 1 使能时钟输出
     *      bit[6:0]: 66, 由公式：Fout = Fin * div_select / 2.0，
     *      1056=24*div_select/2.0, 得出：div_select=66。
     */

     CCM_ANALOG->PLL_ARM = (1 << 13) | ( ( 66 << 0) & 0x7F );
     CCM->CCSR &= ~(1 << 2);       /* 将 pll_sw_clk 时钟切换回 pll1_main_clk */
     CCM->CACRR = 1;            /* ARM 内核时钟为 pll1_sw_clk/2=1056/2=528Mhz */

	/* 2、设置PLL2(SYS PLL)各个PFD */
	reg = CCM_ANALOG->PFD_528;
	reg &= ~(0X3F3F3F3F);		/* 清除原来的设置 						*/
	reg |= 32<<24;				/* PLL2_PFD3=528*18/32=297Mhz 	*/
	reg |= 24<<16;				/* PLL2_PFD2=528*18/24=396Mhz(DDR使用的时钟，最大400Mhz) */
	reg |= 16<<8;				/* PLL2_PFD1=528*18/16=594Mhz 	*/
	reg |= 27<<0;				/* PLL2_PFD0=528*18/27=352Mhz  	*/
	CCM_ANALOG->PFD_528=reg;	/* 设置PLL2_PFD0~3 		 		*/

	/* 3、设置PLL3(USB1)各个PFD */
	reg = 0;					/* 清零   */
	reg = CCM_ANALOG->PFD_480;
	reg &= ~(0X3F3F3F3F);		/* 清除原来的设置 							*/
	reg |= 19<<24;				/* PLL3_PFD3=480*18/19=454.74Mhz 	*/
	reg |= 17<<16;				/* PLL3_PFD2=480*18/17=508.24Mhz 	*/
	reg |= 16<<8;				/* PLL3_PFD1=480*18/16=540Mhz		*/
	reg |= 12<<0;				/* PLL3_PFD0=480*18/12=720Mhz	 	*/
	CCM_ANALOG->PFD_480=reg;	/* 设置PLL3_PFD0~3 					*/	

	/* 4、设置AHB时钟 最小6Mhz， 最大132Mhz (boot rom自动设置好了可以不用设置)*/
	CCM->CBCMR &= ~(3 << 18); 	/* 清除设置*/ 
	CCM->CBCMR |= (1 << 18);	/* pre_periph_clk=PLL2_PFD2=396MHz */
	CCM->CBCDR &= ~(1 << 25);	/* periph_clk=pre_periph_clk=396MHz */
	while(CCM->CDHIPR & (1 << 5));/* 等待握手完成 */
		
	/* 修改AHB_PODF位的时候需要先禁止AHB_CLK_ROOT的输出，但是
	 * 我没有找到关闭AHB_CLK_ROOT输出的的寄存器，所以就没法设置。
	 * 下面设置AHB_PODF的代码仅供学习参考不能直接拿来使用！！
	 * 内部boot rom将AHB_PODF设置为了3分频，即使我们不设置AHB_PODF，
	 * AHB_ROOT_CLK也依旧等于396/3=132Mhz。
	 */
#if 0
	/* 要先关闭AHB_ROOT_CLK输出，否则时钟设置会出错 */
	CCM->CBCDR &= ~(7 << 10);	/* CBCDR的AHB_PODF清零 */
	CCM->CBCDR |= 2 << 10;		/* AHB_PODF 3分频，AHB_CLK_ROOT=132MHz */
	while(CCM->CDHIPR & (1 << 1));/
* 等待握手完成 */
#endif
	
	/* 5、设置IPG_CLK_ROOT最小3Mhz，最大66Mhz (boot rom自动设置好了可以不用设置)*/
	CCM->CBCDR &= ~(3 << 8);	/* CBCDR的IPG_PODF清零 */
	CCM->CBCDR |= 1 << 8;		/* IPG_PODF 2分频，IPG_CLK_ROOT=66MHz */
	
	/* 6、设置PERCLK_CLK_ROOT时钟 */
	CCM->CSCMR1 &= ~(1 << 6);	/* PERCLK_CLK_ROOT时钟源为IPG */
	CCM->CSCMR1 &= ~(7 << 0);	/* PERCLK_PODF位清零，即1分频 */
     
}
```


</details>

<details>
<summary>main.c</summary>

添加 imx6u 的时钟初始化


```c
imx6u_clkinit(); /* 初始化系统时钟 */
```


</details>


## 修改 Makefile


在上一节的 Makefile 文件的基础上新建修改 


```shell
TARGET		  	?= clk # 将其 bsp 修改为 clk， 则最后则会生成 clk.bin
```


## 
编译下载


使用 make 编译然后下载到开发板上进行验证


```shell
make

ls /dev/sd*
./imxdownod clk.bin /dev/sdb
```


效果和上一节一致


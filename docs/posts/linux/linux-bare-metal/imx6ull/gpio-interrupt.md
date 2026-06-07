---
title: "GPIO 中断实验"
category: "Linux"
subCategory: "linux-bare"
subSubCategory: "i.MX6ULL"
---

# GPIO 中断实验


中断系统是一个处理器重要的组成部分，中断系统极大的提高了 CPU 的执行效率


# Correx A7 中断详解


**STM32 中断系统回顾**


STM32 的中断系统主要有以下几个关键点：

- 中断向量表

    中断向量表是一个表，这个表里面存放的是中断向量。中断服务程序的入口地址或存放中断服务程序的首地址成为中断向量，因此中断向量表是一系列中断服务程序入口地址组成的表。这些中断服务程序(函数)在中断向量表中的位置是由半导体厂商定好的，当某个中断被触发以后就会自动跳转到中断向量表中对应的中断服务程序(函数)入口地址处

- NVIC(内嵌向量中断控制器)

    中断系统得有个管理机构，对于 STM32 这种 Cortex-M 内核的单片机来说这个管理机构叫做 NVIC，全称叫做 Nested Vectored Interrupt Controller


    Cortex-A 内核的中断管理机构不叫做NVIC，而是叫做 GIC，全称是 general interrupt controller

- 中断使能

    要使用某个外设的中断，肯定要先使能这个外设的中断

- 中断服务函数

    我们使用中断的目的就是为了使用中断服务函数，当中断发生以后中断服务函数就会被调用，我们要处理的工作就可以放到中断服务函数中去完成


# 硬件


和按键输入的所使用的一致


# 实验程序编写


## 添加相应文件

- 复制上一节的文件夹

    ```shell
    cp -rf 8_clk/ 9_int/
    
    cd 9_int/
    mv 8_clk.code-workspace 9_int.code-workspace
    ```

- 移植 SDK 的 core_ca7.h 并进行修改，我这里直接移植了正点原子的修改好的，直接用 MobaXtern 的上传到 imx6ull 文件夹就好， 接着在 imx6ull.h 中包含该头文件
- 修改 start.s 文件
<details>
<summary>start.s</summary>

```assembly
.global _start

_start:
	ldr pc, =Reset_Handler		/* 复位中断 					*/	
	ldr pc, =Undefined_Handler	/* 未定义中断 					*/
	ldr pc, =SVC_Handler		/* SVC(Supervisor)中断 		*/
	ldr pc, =PrefAbort_Handler	/* 预取终止中断 					*/
	ldr pc, =DataAbort_Handler	/* 数据终止中断 					*/
	ldr	pc, =NotUsed_Handler	/* 未使用中断					*/
	ldr pc, =IRQ_Handler		/* IRQ中断 					*/
	ldr pc, =FIQ_Handler		/* FIQ(快速中断)未定义中断 			*/

/* 复位中断 */	
Reset_Handler:

	cpsid i						/* 关闭全局中断 */

	/* 关闭I,DCache和MMU 
	 * 采取读-改-写的方式。
	 */
	mrc     p15, 0, r0, c1, c0, 0     /* 读取CP15的C1寄存器到R0中       		        	*/
    bic     r0,  r0, #(0x1 << 12)     /* 清除C1寄存器的bit12位(I位)，关闭I Cache            	*/
    bic     r0,  r0, #(0x1 <<  2)     /* 清除C1寄存器的bit2(C位)，关闭D Cache    				*/
    bic     r0,  r0, #0x2             /* 清除C1寄存器的bit1(A位)，关闭对齐						*/
    bic     r0,  r0, #(0x1 << 11)     /* 清除C1寄存器的bit11(Z位)，关闭分支预测					*/
    bic     r0,  r0, #0x1             /* 清除C1寄存器的bit0(M位)，关闭MMU				       	*/
    mcr     p15, 0, r0, c1, c0, 0     /* 将r0寄存器中的值写入到CP15的C1寄存器中	 				*/

	
#if 0
	/* 汇编版本设置中断向量表偏移 */
	ldr r0, =0X87800000

	dsb
	isb
	mcr p15, 0, r0, c12, c0, 0
	dsb
	isb
#endif
    
	/* 设置各个模式下的栈指针，
	 * 注意：IMX6UL的堆栈是向下增长的！
	 * 堆栈指针地址一定要是4字节地址对齐的！！！
	 * DDR范围:0X80000000~0X9FFFFFFF
	 */
	/* 进入IRQ模式 */
	mrs r0, cpsr
	bic r0, r0, #0x1f 	/* 将r0寄存器中的低5位清零，也就是cpsr的M0~M4 	*/
	orr r0, r0, #0x12 	/* r0或上0x13,表示使用IRQ模式					*/
	msr cpsr, r0		/* 将r0 的数据写入到cpsr_c中 					*/
	ldr sp, =0x80600000	/* 设置IRQ模式下的栈首地址为0X80600000,大小为2MB */

	/* 进入SYS模式 */
	mrs r0, cpsr
	bic r0, r0, #0x1f 	/* 将r0寄存器中的低5位清零，也就是cpsr的M0~M4 	*/
	orr r0, r0, #0x1f 	/* r0或上0x13,表示使用SYS模式					*/
	msr cpsr, r0		/* 将r0 的数据写入到cpsr_c中 					*/
	ldr sp, =0x80400000	/* 设置SYS模式下的栈首地址为0X80400000,大小为2MB */

	/* 进入SVC模式 */
	mrs r0, cpsr
	bic r0, r0, #0x1f 	/* 将r0寄存器中的低5位清零，也就是cpsr的M0~M4 	*/
	orr r0, r0, #0x13 	/* r0或上0x13,表示使用SVC模式					*/
	msr cpsr, r0		/* 将r0 的数据写入到cpsr_c中 					*/
	ldr sp, =0X80200000	/* 设置SVC模式下的栈首地址为0X80200000,大小为2MB */

	cpsie i				/* 打开全局中断 */
#if 0
	/* 使能IRQ中断 */
	mrs r0, cpsr		/* 读取cpsr寄存器值到r0中 			*/
	bic r0, r0, #0x80	/* 将r0寄存器中bit7清零，也就是CPSR中的I位清零，表示允许IRQ中断 */
	msr cpsr, r0		/* 将r0重新写入到cpsr中 			*/
#endif

	b main				/* 跳转到main函数 			 	*/

/* 未定义中断 */
Undefined_Handler:
	ldr r0, =Undefined_Handler
	bx r0

/* SVC中断 */
SVC_Handler:
	ldr r0, =SVC_Handler
	bx r0

/* 预取终止中断 */
PrefAbort_Handler:
	ldr r0, =PrefAbort_Handler	
	bx r0

/* 数据终止中断 */
DataAbort_Handler:
	ldr r0, =DataAbort_Handler
	bx r0

/* 未使用的中断 */
NotUsed_Handler:

	ldr r0, =NotUsed_Handler
	bx r0

/* IRQ中断！重点！！！！！ */
IRQ_Handler:
	push {lr}					/* 保存lr地址 */
	push {r0-r3, r12}			/* 保存r0-r3，r12寄存器 */

	mrs r0, spsr				/* 读取spsr寄存器 */
	push {r0}					/* 保存spsr寄存器 */

	mrc p15, 4, r1, c15, c0, 0 /* 从CP15的C0寄存器内的值到R1寄存器中
								* 参考文档ARM Cortex-A(armV7)编程手册V4.0.pdf P49
								* Cortex-A7 Technical ReferenceManua.pdf P68 P138
								*/							
	add r1, r1, #0X2000			/* GIC基地址加0X2000，也就是GIC的CPU接口端基地址 */
	ldr r0, [r1, #0XC]			/* GIC的CPU接口端基地址加0X0C就是GICC_IAR寄存器，
								 * GICC_IAR寄存器保存这当前发生中断的中断号，我们要根据
								 * 这个中断号来绝对调用哪个中断服务函数
								 */
	push {r0, r1}				/* 保存r0,r1 */
	
	cps #0x13					/* 进入SVC模式，允许其他中断再次进去 */
	
	push {lr}					/* 保存SVC模式的lr寄存器 */
	ldr r2, =system_irqhandler	/* 加载C语言中断处理函数到r2寄存器中*/
	blx r2						/* 运行C语言中断处理函数，带有一个参数，保存在R0寄存器中 */

	pop {lr}					/* 执行完C语言中断服务函数，lr出栈 */
	cps #0x12					/* 进入IRQ模式 */
	pop {r0, r1}				
	str r0, [r1, #0X10]			/* 中断执行完成，写EOIR */

	pop {r0}						
	msr spsr_cxsf, r0			/* 恢复spsr */

	pop {r0-r3, r12}			/* r0-r3,r12出栈 */
	pop {lr}					/* lr出栈 */
	subs pc, lr, #4				/* 将lr-4赋给pc */
	
	

/* FIQ中断 */
FIQ_Handler:

	ldr r0, =FIQ_Handler	
	bx r0
```


</details>

- 新建 int 文件夹

    在此文件夹下创建 bsp_int.c 和 bsp_int.h 文件，存放中断函数

<details>
<summary>bsp_int.c</summary>

```c
#include "bsp_int.h"
/***************************************************************
Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.
文件名	: 	 bsp_int.c
作者	   : 左忠凯
版本	   : V1.0
描述	   : 中断驱动文件。
其他	   : 无
论坛 	   : www.wtmembed.com
日志	   : 初版V1.0 2019/1/4 左忠凯创建
***************************************************************/

/* 中断嵌套计数器 */
static unsigned int irqNesting;

/* 中断服务函数表 */
static sys_irq_handle_t irqTable[NUMBER_OF_INT_VECTORS];

/*
 * @description	: 中断初始化函数
 * @param		: 无
 * @return 		: 无
 */
void int_init(void)
{
	GIC_Init(); 						/* 初始化GIC 							*/
	system_irqtable_init();				/* 初始化中断表 							*/
	__set_VBAR((uint32_t)0x87800000); 	/* 中断向量表偏移，偏移到起始地址   				*/
}

/*
 * @description	: 初始化中断服务函数表 
 * @param		: 无
 * @return 		: 无
 */
void system_irqtable_init(void)
{
	unsigned int i = 0;
	irqNesting = 0;
	
	/* 先将所有的中断服务函数设置为默认值 */
	for(i = 0; i < NUMBER_OF_INT_VECTORS; i++)
	{
		system_register_irqhandler((IRQn_Type)i,default_irqhandler, NULL);
	}
}

/*
 * @description			: 给指定的中断号注册中断服务函数 
 * @param - irq			: 要注册的中断号
 * @param - handler		: 要注册的中断处理函数
 * @param - usrParam	: 中断服务处理函数参数
 * @return 				: 无
 */
void system_register_irqhandler(IRQn_Type irq, system_irq_handler_t handler, void *userParam) 
{
	irqTable[irq].irqHandler = handler;
  	irqTable[irq].userParam = userParam;
}

/*
 * @description			: C语言中断服务函数，irq汇编中断服务函数会
 						  调用此函数，此函数通过在中断服务列表中查
 						  找指定中断号所对应的中断处理函数并执行。
 * @param - giccIar		: 中断号
 * @return 				: 无
 */
void system_irqhandler(unsigned int giccIar) 
{

   uint32_t intNum = giccIar & 0x3FFUL;
   
   /* 检查中断号是否符合要求 */
   if ((intNum == 1023) || (intNum >= NUMBER_OF_INT_VECTORS))
   {
	 	return;
   }
 
   irqNesting++;	/* 中断嵌套计数器加一 */

   /* 根据传递进来的中断号，在irqTable中调用确定的中断服务函数*/
   irqTable[intNum].irqHandler(intNum, irqTable[intNum].userParam);
 
   irqNesting--;	/* 中断执行完成，中断嵌套寄存器减一 */

}

/*
 * @description			: 默认中断服务函数
 * @param - giccIar		: 中断号
 * @param - usrParam	: 中断服务处理函数参数
 * @return 				: 无
 */
void default_irqhandler(unsigned int giccIar, void *userParam) 
{
	while(1) 
  	{
   	}
}
```


</details>

<details>
<summary>bsp_int.h</summary>

```c
#ifndef __BSP_INT_H_  
#define __BSP_INT_H_

#include "imx6ul.h"

/* 中断服务函数形式 */ 
typedef void (*system_irq_handler_t) (unsigned int giccIar, void *param);

 
/* 中断服务函数结构体*/
typedef struct _sys_irq_handle
{
    system_irq_handler_t irqHandler; /* 中断服务函数 */
    void *userParam;                 /* 中断服务函数参数 */
} sys_irq_handle_t;


void int_init(void);
void system_irqtable_init(void);
void system_register_irqhandler(IRQn_Type irq, system_irq_handler_t handler, void *userParam);
void system_irqhandler(unsigned int giccIar); 
void default_irqhandler(unsigned int giccIar, void *userParam); 



#endif
```


</details>

- 修改 gpio 文件
<details>
<summary>bsp_gpio.h</summary>

```c
#ifndef _BSP_GPIO_H
#define _BSP_GPIO_H
#define _BSP_KEY_H
#include "imx6ul.h"
/***************************************************************
Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.
文件名	: 	 bsp_gpio.h
作者	   : 左忠凯
版本	   : V1.0
描述	   : GPIO操作文件头文件。
其他	   : 无
论坛 	   : www.wtmembed.com
日志	   : 初版V1.0 2019/1/4 左忠凯创建
	 	 V2.0 2019/1/4 左忠凯修改
	 	 添加GPIO中断相关定义

***************************************************************/

/* 
 * 枚举类型和结构体定义 
 */
typedef enum _gpio_pin_direction
{
    kGPIO_DigitalInput = 0U,  		/* 输入 */
    kGPIO_DigitalOutput = 1U, 		/* 输出 */
} gpio_pin_direction_t;

/*
 * GPIO中断触发类型枚举
 */
typedef enum _gpio_interrupt_mode
{
    kGPIO_NoIntmode = 0U, 				/* 无中断功能 */
    kGPIO_IntLowLevel = 1U, 			/* 低电平触发	*/
    kGPIO_IntHighLevel = 2U, 			/* 高电平触发 */
    kGPIO_IntRisingEdge = 3U, 			/* 上升沿触发	*/
    kGPIO_IntFallingEdge = 4U, 			/* 下降沿触发 */
    kGPIO_IntRisingOrFallingEdge = 5U, 	/* 上升沿和下降沿都触发 */
} gpio_interrupt_mode_t;	

/*
 * GPIO配置结构体
 */	
typedef struct _gpio_pin_config
{
    gpio_pin_direction_t direction; 		/* GPIO方向:输入还是输出 */
    uint8_t outputLogic;            		/* 如果是输出的话，默认输出电平 */
	gpio_interrupt_mode_t interruptMode;	/* 中断方式 */
} gpio_pin_config_t;


/* 函数声明 */
void gpio_init(GPIO_Type *base, int pin, gpio_pin_config_t *config);
int gpio_pinread(GPIO_Type *base, int pin);
void gpio_pinwrite(GPIO_Type *base, int pin, int value);
void gpio_intconfig(GPIO_Type* base, unsigned int pin, gpio_interrupt_mode_t pinInterruptMode);
void gpio_enableint(GPIO_Type* base, unsigned int pin);
void gpio_disableint(GPIO_Type* base, unsigned int pin);
void gpio_clearintflags(GPIO_Type* base, unsigned int pin);

#endif
```


</details>

<details>
<summary>bsp_gpio.c</summary>

```c
#include "bsp_gpio.h"
/***************************************************************
Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.
文件名	: 	 bsp_gpio.h
作者	   : 左忠凯
版本	   : V1.0
描述	   : GPIO操作文件。
其他	   : 无
论坛 	   : www.wtmembed.com
日志	   : 初版V1.0 2019/1/4 左忠凯创建
		 V2.0 2019/1/4 左忠凯修改:
		 修改gpio_init()函数，支持中断配置.
		 添加gpio_intconfig()函数，初始化中断
		 添加gpio_enableint()函数，使能中断
		 添加gpio_clearintflags()函数，清除中断标志位
		 
***************************************************************/

/*
 * @description		: GPIO初始化。
 * @param - base	: 要初始化的GPIO组。
 * @param - pin		: 要初始化GPIO在组内的编号。
 * @param - config	: GPIO配置结构体。
 * @return 			: 无
 */
void gpio_init(GPIO_Type *base, int pin, gpio_pin_config_t *config)
{
	base->IMR &= ~(1U << pin);
	
	if(config->direction == kGPIO_DigitalInput) /* GPIO作为输入 */
	{
		base->GDIR &= ~( 1 << pin);
	}
	else										/* 输出 */
	{
		base->GDIR |= 1 << pin;
		gpio_pinwrite(base,pin, config->outputLogic);	/* 设置默认输出电平 */
	}
	gpio_intconfig(base, pin, config->interruptMode);	/* 中断功能配置 */
}

/*
 * @description	 : 读取指定GPIO的电平值 。
 * @param - base	 : 要读取的GPIO组。
 * @param - pin	 : 要读取的GPIO脚号。
 * @return 		 : 无
 */
 int gpio_pinread(GPIO_Type *base, int pin)
 {
	 return (((base->DR) >> pin) & 0x1);
 }

/*
 * @description	 : 指定GPIO输出高或者低电平 。
 * @param - base	 : 要输出的的GPIO组。
 * @param - pin	 : 要输出的GPIO脚号。
 * @param - value	 : 要输出的电平，1 输出高电平， 0 输出低低电平
 * @return 		 : 无
 */
void gpio_pinwrite(GPIO_Type *base, int pin, int value)
{
	 if (value == 0U)
	 {
		 base->DR &= ~(1U << pin); /* 输出低电平 */
	 }
	 else
	 {
		 base->DR |= (1U << pin); /* 输出高电平 */
	 }
}

/*
 * @description  			: 设置GPIO的中断配置功能
 * @param - base 			: 要配置的IO所在的GPIO组。
 * @param - pin  			a: 要配置的GPIO脚号。
 * @param - pinInterruptMode: 中断模式，参考枚举类型gpio_interrupt_mode_t
 * @return		 			: 无
 */
void gpio_intconfig(GPIO_Type* base, unsigned int pin, gpio_interrupt_mode_t pin_int_mode)
{
	volatile uint32_t *icr;
	uint32_t icrShift;

	icrShift = pin;
	
	base->EDGE_SEL &= ~(1U << pin);

	if(pin < 16) 	/* 低16位 */
	{
		icr = &(base->ICR1);
	}
	else			/* 高16位 */
	{
		icr = &(base->ICR2);
		icrShift -= 16;
	}
	switch(pin_int_mode)
	{
		case(kGPIO_IntLowLevel):
			*icr &= ~(3U << (2 * icrShift));
			break;
		case(kGPIO_IntHighLevel):
			*icr = (*icr & (~(3U << (2 * icrShift)))) | (1U << (2 * icrShift));
			break;
		case(kGPIO_IntRisingEdge):
			*icr = (*icr & (~(3U << (2 * icrShift)))) | (2U << (2 * icrShift));
			break;
		case(kGPIO_IntFallingEdge):
			*icr |= (3U << (2 * icrShift));
			break;
		case(kGPIO_IntRisingOrFallingEdge):
			base->EDGE_SEL |= (1U << pin);
			break;
		default:
			break;
	}
}


/*
 * @description  			: 使能GPIO的中断功能
 * @param - base 			: 要使能的IO所在的GPIO组。
 * @param - pin  			: 要使能的GPIO在组内的编号。
 * @return		 			: 无
 */
void gpio_enableint(GPIO_Type* base, unsigned int pin)
{ 
    base->IMR |= (1 << pin);
}

/*
 * @description  			: 禁止GPIO的中断功能
 * @param - base 			: 要禁止的IO所在的GPIO组。
 * @param - pin  			: 要禁止的GPIO在组内的编号。
 * @return		 			: 无
 */
void gpio_disableint(GPIO_Type* base, unsigned int pin)
{ 
    base->IMR &= ~(1 << pin);
}

/*
 * @description  			: 清除中断标志位(写1清除)
 * @param - base 			: 要清除的IO所在的GPIO组。
 * @param - pin  			: 要清除的GPIO掩码。
 * @return		 			: 无
 */
void gpio_clearintflags(GPIO_Type* base, unsigned int pin)
{
    base->ISR |= (1 << pin);
}
```


</details>

- 添加 exit 文件夹

    在此文件下创建 bsp_exit.c 和 bsp_exit.h 文件

<details>
<summary>bsp_exit.c</summary>

```c
/***************************************************************
Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.
文件名	: 	 bsp_exit.c
作者	   : 左忠凯
版本	   : V1.0
描述	   : 外部中断驱动。
其他	   : 配置按键对应的GPIP为中断模式
论坛 	   : www.wtmembed.com
日志	   : 初版V1.0 2019/1/4 左忠凯创建
***************************************************************/
#include "bsp_exit.h"
#include "bsp_gpio.h"
#include "bsp_int.h"
#include "bsp_delay.h"
#include "bsp_beep.h"

/*
 * @description			: 初始化外部中断
 * @param				: 无
 * @return 				: 无
 */
void exit_init(void)
{
	gpio_pin_config_t key_config;

	/* 1、设置IO复用 */
	IOMUXC_SetPinMux(IOMUXC_UART1_CTS_B_GPIO1_IO18,0);			/* 复用为GPIO1_IO18 */
	IOMUXC_SetPinConfig(IOMUXC_UART1_CTS_B_GPIO1_IO18,0xF080);

	/* 2、初始化GPIO为中断模式 */
	key_config.direction = kGPIO_DigitalInput;
	key_config.interruptMode = kGPIO_IntFallingEdge;
	key_config.outputLogic = 1;
	gpio_init(GPIO1, 18, &key_config);

	GIC_EnableIRQ(GPIO1_Combined_16_31_IRQn);				/* 使能GIC中对应的中断 */
	system_register_irqhandler(GPIO1_Combined_16_31_IRQn, (system_irq_handler_t)gpio1_io18_irqhandler, NULL);	/* 注册中断服务函数 */
	gpio_enableint(GPIO1, 18);								/* 使能GPIO1_IO18的中断功能 */
}

/*
 * @description			: GPIO1_IO18最终的中断处理函数
 * @param				: 无
 * @return 				: 无
 */
void gpio1_io18_irqhandler(void)
{ 
	static unsigned char state = 0;

	/*
	 *采用延时消抖，中断服务函数中禁止使用延时函数！因为中断服务需要
	 *快进快出！！这里为了演示所以采用了延时函数进行消抖，后面我们会讲解
	 *定时器中断消抖法！！！
 	 */

	delay(10);
	if(gpio_pinread(GPIO1, 18) == 0)	/* 按键按下了  */
	{
		state = !state;
		beep_switch(state);
	}
	
	gpio_clearintflags(GPIO1, 18); /* 清除中断标志位 */
}
```


</details>

<details>
<summary>bsp_exit.h</summary>

```c
#ifndef _BSP_EXIT_H
#define _BSP_EXIT_H
/***************************************************************
Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.
文件名	: 	 bsp_exit.c
作者	   : 左忠凯
版本	   : V1.0
描述	   : 外部中断驱动头文件。
其他	   : 配置按键对应的GPIP为中断模式
论坛 	   : www.wtmembed.com
日志	   : 初版V1.0 2019/1/4 左忠凯创建
***************************************************************/
#include "imx6ul.h"

/* 函数声明 */
void exit_init(void);						/* 中断初始化 */
void gpio1_io18_irqhandler(void); 			/* 中断处理函数 */

#endif
```


</details>

- 修改 main.c 文件
<details>
<summary>main.c</summary>

```c
#include "bsp_clk.h"
#include "bsp_delay.h"
#include "bsp_led.h"
#include "bsp_beep.h"
#include "bsp_key.h"
#include "bsp_int.h"
#include "bsp_exit.h"


/*
 * 点灯步骤
 * 1. 使能GPIO时钟
 * 2. 设置GPIO复用功能
 * 3. 配置GPIO的电气属性
 * 4. 设置GPIO的输出模式
 * 5. 将 GPIO 对应的灯置 高/低 电平
 */
int main(void)
{
	unsigned char state = OFF;

	int_init(); 		/* 初始化中断(一定要最先调用！) */
	imx6u_clkinit();	/* 初始化系统时钟 			*/
	clk_enable();		/* 使能所有的时钟 			*/
	led_init();			/* 初始化led 			*/
	beep_init();		/* 初始化beep	 		*/
	key_init();			/* 初始化key 			*/
	exit_init();		/* 初始化按键中断			*/

	while(1)			
	{	
		state = !state;
		led_switch(LED0, state);
		delay(500);
	}

	return 0;
}
```


</details>


## 修改 Makefile 文件


修改生成的目标文件为 int ， 添加 int 和 exit 的路径即可


```makefile
TARGET		  	?= int

				   bsp/exit \
				   bsp/int
```


## 编译下载


编译下载后验证，效果应该和上一节的内容一致，不过实现效果改为了中断


```shell
ls /dev/sd*
./imxdownload int.bin /dev/sdb
```


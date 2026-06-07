import{_ as i,o as a,c as n,a3 as p}from"./chunks/framework.yp5TROV7.js";const g=JSON.parse('{"title":"GPIO 中断实验","description":"","frontmatter":{"title":"GPIO 中断实验","category":"Linux","subCategory":"linux-bare","subSubCategory":"i.MX6ULL"},"headers":[],"relativePath":"posts/linux/linux-bare-metal/imx6ull/gpio-interrupt.md","filePath":"posts/linux/linux-bare-metal/imx6ull/gpio-interrupt.md"}'),l={name:"posts/linux/linux-bare-metal/imx6ull/gpio-interrupt.md"};function t(h,s,k,e,r,E){return a(),n("div",null,[...s[0]||(s[0]=[p(`<p>中断系统是一个处理器重要的组成部分，中断系统极大的提高了 CPU 的执行效率</p><h2 id="correx-a7-中断详解" tabindex="-1">Correx A7 中断详解 <a class="header-anchor" href="#correx-a7-中断详解" aria-label="Permalink to &quot;Correx A7 中断详解&quot;">​</a></h2><p><strong>STM32 中断系统回顾</strong></p><p>STM32 的中断系统主要有以下几个关键点：</p><ul><li><p>中断向量表</p><p>中断向量表是一个表，这个表里面存放的是中断向量。中断服务程序的入口地址或存放中断服务程序的首地址成为中断向量，因此中断向量表是一系列中断服务程序入口地址组成的表。这些中断服务程序(函数)在中断向量表中的位置是由半导体厂商定好的，当某个中断被触发以后就会自动跳转到中断向量表中对应的中断服务程序(函数)入口地址处</p></li><li><p>NVIC(内嵌向量中断控制器)</p><p>中断系统得有个管理机构，对于 STM32 这种 Cortex-M 内核的单片机来说这个管理机构叫做 NVIC，全称叫做 Nested Vectored Interrupt Controller</p><p>Cortex-A 内核的中断管理机构不叫做NVIC，而是叫做 GIC，全称是 general interrupt controller</p></li><li><p>中断使能</p><p>要使用某个外设的中断，肯定要先使能这个外设的中断</p></li><li><p>中断服务函数</p><p>我们使用中断的目的就是为了使用中断服务函数，当中断发生以后中断服务函数就会被调用，我们要处理的工作就可以放到中断服务函数中去完成</p></li></ul><h2 id="硬件" tabindex="-1">硬件 <a class="header-anchor" href="#硬件" aria-label="Permalink to &quot;硬件&quot;">​</a></h2><p>和按键输入的所使用的一致</p><h2 id="实验程序编写" tabindex="-1">实验程序编写 <a class="header-anchor" href="#实验程序编写" aria-label="Permalink to &quot;实验程序编写&quot;">​</a></h2><h2 id="添加相应文件" tabindex="-1">添加相应文件 <a class="header-anchor" href="#添加相应文件" aria-label="Permalink to &quot;添加相应文件&quot;">​</a></h2><ul><li><p>复制上一节的文件夹</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -rf</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 8_clk/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 9_int/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 9_int/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mv</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 8_clk.code-workspace</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 9_int.code-workspace</span></span></code></pre></div></li><li><p>移植 SDK 的 core_ca7.h 并进行修改，我这里直接移植了正点原子的修改好的，直接用 MobaXtern 的上传到 imx6ull 文件夹就好， 接着在 imx6ull.h 中包含该头文件</p></li><li><p>修改 start.s 文件</p></li></ul><details><summary>start.s</summary><div class="language-assembly vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">assembly</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>.global _start</span></span>
<span class="line"><span></span></span>
<span class="line"><span>_start:</span></span>
<span class="line"><span>	ldr pc, =Reset_Handler		/* 复位中断 					*/	</span></span>
<span class="line"><span>	ldr pc, =Undefined_Handler	/* 未定义中断 					*/</span></span>
<span class="line"><span>	ldr pc, =SVC_Handler		/* SVC(Supervisor)中断 		*/</span></span>
<span class="line"><span>	ldr pc, =PrefAbort_Handler	/* 预取终止中断 					*/</span></span>
<span class="line"><span>	ldr pc, =DataAbort_Handler	/* 数据终止中断 					*/</span></span>
<span class="line"><span>	ldr	pc, =NotUsed_Handler	/* 未使用中断					*/</span></span>
<span class="line"><span>	ldr pc, =IRQ_Handler		/* IRQ中断 					*/</span></span>
<span class="line"><span>	ldr pc, =FIQ_Handler		/* FIQ(快速中断)未定义中断 			*/</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* 复位中断 */	</span></span>
<span class="line"><span>Reset_Handler:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	cpsid i						/* 关闭全局中断 */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	/* 关闭I,DCache和MMU </span></span>
<span class="line"><span>	 * 采取读-改-写的方式。</span></span>
<span class="line"><span>	 */</span></span>
<span class="line"><span>	mrc     p15, 0, r0, c1, c0, 0     /* 读取CP15的C1寄存器到R0中       		        	*/</span></span>
<span class="line"><span>    bic     r0,  r0, #(0x1 &lt;&lt; 12)     /* 清除C1寄存器的bit12位(I位)，关闭I Cache            	*/</span></span>
<span class="line"><span>    bic     r0,  r0, #(0x1 &lt;&lt;  2)     /* 清除C1寄存器的bit2(C位)，关闭D Cache    				*/</span></span>
<span class="line"><span>    bic     r0,  r0, #0x2             /* 清除C1寄存器的bit1(A位)，关闭对齐						*/</span></span>
<span class="line"><span>    bic     r0,  r0, #(0x1 &lt;&lt; 11)     /* 清除C1寄存器的bit11(Z位)，关闭分支预测					*/</span></span>
<span class="line"><span>    bic     r0,  r0, #0x1             /* 清除C1寄存器的bit0(M位)，关闭MMU				       	*/</span></span>
<span class="line"><span>    mcr     p15, 0, r0, c1, c0, 0     /* 将r0寄存器中的值写入到CP15的C1寄存器中	 				*/</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>#if 0</span></span>
<span class="line"><span>	/* 汇编版本设置中断向量表偏移 */</span></span>
<span class="line"><span>	ldr r0, =0X87800000</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	dsb</span></span>
<span class="line"><span>	isb</span></span>
<span class="line"><span>	mcr p15, 0, r0, c12, c0, 0</span></span>
<span class="line"><span>	dsb</span></span>
<span class="line"><span>	isb</span></span>
<span class="line"><span>#endif</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>	/* 设置各个模式下的栈指针，</span></span>
<span class="line"><span>	 * 注意：IMX6UL的堆栈是向下增长的！</span></span>
<span class="line"><span>	 * 堆栈指针地址一定要是4字节地址对齐的！！！</span></span>
<span class="line"><span>	 * DDR范围:0X80000000~0X9FFFFFFF</span></span>
<span class="line"><span>	 */</span></span>
<span class="line"><span>	/* 进入IRQ模式 */</span></span>
<span class="line"><span>	mrs r0, cpsr</span></span>
<span class="line"><span>	bic r0, r0, #0x1f 	/* 将r0寄存器中的低5位清零，也就是cpsr的M0~M4 	*/</span></span>
<span class="line"><span>	orr r0, r0, #0x12 	/* r0或上0x13,表示使用IRQ模式					*/</span></span>
<span class="line"><span>	msr cpsr, r0		/* 将r0 的数据写入到cpsr_c中 					*/</span></span>
<span class="line"><span>	ldr sp, =0x80600000	/* 设置IRQ模式下的栈首地址为0X80600000,大小为2MB */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	/* 进入SYS模式 */</span></span>
<span class="line"><span>	mrs r0, cpsr</span></span>
<span class="line"><span>	bic r0, r0, #0x1f 	/* 将r0寄存器中的低5位清零，也就是cpsr的M0~M4 	*/</span></span>
<span class="line"><span>	orr r0, r0, #0x1f 	/* r0或上0x13,表示使用SYS模式					*/</span></span>
<span class="line"><span>	msr cpsr, r0		/* 将r0 的数据写入到cpsr_c中 					*/</span></span>
<span class="line"><span>	ldr sp, =0x80400000	/* 设置SYS模式下的栈首地址为0X80400000,大小为2MB */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	/* 进入SVC模式 */</span></span>
<span class="line"><span>	mrs r0, cpsr</span></span>
<span class="line"><span>	bic r0, r0, #0x1f 	/* 将r0寄存器中的低5位清零，也就是cpsr的M0~M4 	*/</span></span>
<span class="line"><span>	orr r0, r0, #0x13 	/* r0或上0x13,表示使用SVC模式					*/</span></span>
<span class="line"><span>	msr cpsr, r0		/* 将r0 的数据写入到cpsr_c中 					*/</span></span>
<span class="line"><span>	ldr sp, =0X80200000	/* 设置SVC模式下的栈首地址为0X80200000,大小为2MB */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	cpsie i				/* 打开全局中断 */</span></span>
<span class="line"><span>#if 0</span></span>
<span class="line"><span>	/* 使能IRQ中断 */</span></span>
<span class="line"><span>	mrs r0, cpsr		/* 读取cpsr寄存器值到r0中 			*/</span></span>
<span class="line"><span>	bic r0, r0, #0x80	/* 将r0寄存器中bit7清零，也就是CPSR中的I位清零，表示允许IRQ中断 */</span></span>
<span class="line"><span>	msr cpsr, r0		/* 将r0重新写入到cpsr中 			*/</span></span>
<span class="line"><span>#endif</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	b main				/* 跳转到main函数 			 	*/</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* 未定义中断 */</span></span>
<span class="line"><span>Undefined_Handler:</span></span>
<span class="line"><span>	ldr r0, =Undefined_Handler</span></span>
<span class="line"><span>	bx r0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* SVC中断 */</span></span>
<span class="line"><span>SVC_Handler:</span></span>
<span class="line"><span>	ldr r0, =SVC_Handler</span></span>
<span class="line"><span>	bx r0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* 预取终止中断 */</span></span>
<span class="line"><span>PrefAbort_Handler:</span></span>
<span class="line"><span>	ldr r0, =PrefAbort_Handler	</span></span>
<span class="line"><span>	bx r0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* 数据终止中断 */</span></span>
<span class="line"><span>DataAbort_Handler:</span></span>
<span class="line"><span>	ldr r0, =DataAbort_Handler</span></span>
<span class="line"><span>	bx r0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* 未使用的中断 */</span></span>
<span class="line"><span>NotUsed_Handler:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	ldr r0, =NotUsed_Handler</span></span>
<span class="line"><span>	bx r0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* IRQ中断！重点！！！！！ */</span></span>
<span class="line"><span>IRQ_Handler:</span></span>
<span class="line"><span>	push {lr}					/* 保存lr地址 */</span></span>
<span class="line"><span>	push {r0-r3, r12}			/* 保存r0-r3，r12寄存器 */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	mrs r0, spsr				/* 读取spsr寄存器 */</span></span>
<span class="line"><span>	push {r0}					/* 保存spsr寄存器 */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	mrc p15, 4, r1, c15, c0, 0 /* 从CP15的C0寄存器内的值到R1寄存器中</span></span>
<span class="line"><span>								* 参考文档ARM Cortex-A(armV7)编程手册V4.0.pdf P49</span></span>
<span class="line"><span>								* Cortex-A7 Technical ReferenceManua.pdf P68 P138</span></span>
<span class="line"><span>								*/							</span></span>
<span class="line"><span>	add r1, r1, #0X2000			/* GIC基地址加0X2000，也就是GIC的CPU接口端基地址 */</span></span>
<span class="line"><span>	ldr r0, [r1, #0XC]			/* GIC的CPU接口端基地址加0X0C就是GICC_IAR寄存器，</span></span>
<span class="line"><span>								 * GICC_IAR寄存器保存这当前发生中断的中断号，我们要根据</span></span>
<span class="line"><span>								 * 这个中断号来绝对调用哪个中断服务函数</span></span>
<span class="line"><span>								 */</span></span>
<span class="line"><span>	push {r0, r1}				/* 保存r0,r1 */</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>	cps #0x13					/* 进入SVC模式，允许其他中断再次进去 */</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>	push {lr}					/* 保存SVC模式的lr寄存器 */</span></span>
<span class="line"><span>	ldr r2, =system_irqhandler	/* 加载C语言中断处理函数到r2寄存器中*/</span></span>
<span class="line"><span>	blx r2						/* 运行C语言中断处理函数，带有一个参数，保存在R0寄存器中 */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	pop {lr}					/* 执行完C语言中断服务函数，lr出栈 */</span></span>
<span class="line"><span>	cps #0x12					/* 进入IRQ模式 */</span></span>
<span class="line"><span>	pop {r0, r1}				</span></span>
<span class="line"><span>	str r0, [r1, #0X10]			/* 中断执行完成，写EOIR */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	pop {r0}						</span></span>
<span class="line"><span>	msr spsr_cxsf, r0			/* 恢复spsr */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	pop {r0-r3, r12}			/* r0-r3,r12出栈 */</span></span>
<span class="line"><span>	pop {lr}					/* lr出栈 */</span></span>
<span class="line"><span>	subs pc, lr, #4				/* 将lr-4赋给pc */</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* FIQ中断 */</span></span>
<span class="line"><span>FIQ_Handler:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	ldr r0, =FIQ_Handler	</span></span>
<span class="line"><span>	bx r0</span></span></code></pre></div></details><ul><li><p>新建 int 文件夹</p><p>在此文件夹下创建 bsp_int.c 和 bsp_int.h 文件，存放中断函数</p></li></ul><details><summary>bsp_int.c</summary><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_int.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/***************************************************************</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">文件名	: 	 bsp_int.c</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">作者	   : 左忠凯</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">版本	   : V1.0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">描述	   : 中断驱动文件。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">其他	   : 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">论坛 	   : www.wtmembed.com</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">日志	   : 初版V1.0 2019/1/4 左忠凯创建</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">***************************************************************/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* 中断嵌套计数器 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> irqNesting;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* 中断服务函数表 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">static</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> sys_irq_handle_t</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> irqTable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[NUMBER_OF_INT_VECTORS];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description	: 中断初始化函数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param		: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 		: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> int_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	GIC_Init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 						/* 初始化GIC 							*/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	system_irqtable_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">				/* 初始化中断表 							*/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	__set_VBAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">uint32_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">0x</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">87800000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 	/* 中断向量表偏移，偏移到起始地址   				*/</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description	: 初始化中断服务函数表 </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param		: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 		: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> system_irqtable_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	irqNesting </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 先将所有的中断服务函数设置为默认值 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NUMBER_OF_INT_VECTORS; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">		system_register_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((IRQn_Type)i,default_irqhandler, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description			: 给指定的中断号注册中断服务函数 </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - irq			: 要注册的中断号</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - handler		: 要注册的中断处理函数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - usrParam	: 中断服务处理函数参数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 				: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> system_register_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IRQn_Type </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">irq</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">system_irq_handler_t</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> handler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">userParam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">	irqTable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[irq].irqHandler </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> handler;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  	irqTable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[irq].userParam </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userParam;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description			: C语言中断服务函数，irq汇编中断服务函数会</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 						  调用此函数，此函数通过在中断服务列表中查</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 						  找指定中断号所对应的中断处理函数并执行。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - giccIar		: 中断号</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 				: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> system_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> giccIar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">   uint32_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> intNum </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> giccIar </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> 0x</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3FF</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   /* 检查中断号是否符合要求 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">   if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ((intNum </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1023</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (intNum </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NUMBER_OF_INT_VECTORS))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	 	return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   irqNesting</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 中断嵌套计数器加一 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   /* 根据传递进来的中断号，在irqTable中调用确定的中断服务函数*/</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">   irqTable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[intNum].</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">irqHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(intNum, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">irqTable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[intNum].userParam);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   irqNesting</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">--</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 中断执行完成，中断嵌套寄存器减一 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description			: 默认中断服务函数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - giccIar		: 中断号</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - usrParam	: 中断服务处理函数参数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 				: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> default_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> giccIar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">userParam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  	{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">   	}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></details><details><summary>bsp_int.h</summary><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#ifndef</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> __BSP_INT_H_</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#define</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> __BSP_INT_H_</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;imx6ul.h&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* 中断服务函数形式 */</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typedef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">system_irq_handler_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> giccIar, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">param);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* 中断服务函数结构体*/</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typedef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> _sys_irq_handle</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    system_irq_handler_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> irqHandler;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> /* 中断服务函数 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">userParam;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                 /* 中断服务函数参数 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">sys_irq_handle_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> int_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> system_irqtable_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> system_register_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IRQn_Type </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">irq</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">system_irq_handler_t</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> handler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">userParam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> system_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> giccIar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">); </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> default_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> giccIar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">userParam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">); </span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#endif</span></span></code></pre></div></details><ul><li>修改 gpio 文件</li></ul><details><summary>bsp_gpio.h</summary><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#ifndef</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> _BSP_GPIO_H</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#define</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> _BSP_GPIO_H</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#define</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> _BSP_KEY_H</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;imx6ul.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/***************************************************************</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">文件名	: 	 bsp_gpio.h</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">作者	   : 左忠凯</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">版本	   : V1.0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">描述	   : GPIO操作文件头文件。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">其他	   : 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">论坛 	   : www.wtmembed.com</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">日志	   : 初版V1.0 2019/1/4 左忠凯创建</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	 	 V2.0 2019/1/4 左忠凯修改</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	 	 添加GPIO中断相关定义</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">***************************************************************/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 枚举类型和结构体定义 </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typedef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> _gpio_pin_direction</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    kGPIO_DigitalInput</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  		/* 输入 */</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    kGPIO_DigitalOutput</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 		/* 输出 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">gpio_pin_direction_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * GPIO中断触发类型枚举</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typedef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> _gpio_interrupt_mode</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    kGPIO_NoIntmode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 				/* 无中断功能 */</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    kGPIO_IntLowLevel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 			/* 低电平触发	*/</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    kGPIO_IntHighLevel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 			/* 高电平触发 */</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    kGPIO_IntRisingEdge</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 			/* 上升沿触发	*/</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    kGPIO_IntFallingEdge</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 4</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 			/* 下降沿触发 */</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    kGPIO_IntRisingOrFallingEdge</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 5</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 	/* 上升沿和下降沿都触发 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">gpio_interrupt_mode_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;	</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * GPIO配置结构体</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typedef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> _gpio_pin_config</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    gpio_pin_direction_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> direction;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 		/* GPIO方向:输入还是输出 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    uint8_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> outputLogic;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            		/* 如果是输出的话，默认输出电平 */</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">	gpio_interrupt_mode_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> interruptMode;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 中断方式 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">gpio_pin_config_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* 函数声明 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">gpio_pin_config_t</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_pinread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_pinwrite</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_intconfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">gpio_interrupt_mode_t</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pinInterruptMode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_enableint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_disableint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_clearintflags</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#endif</span></span></code></pre></div></details><details><summary>bsp_gpio.c</summary><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_gpio.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/***************************************************************</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">文件名	: 	 bsp_gpio.h</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">作者	   : 左忠凯</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">版本	   : V1.0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">描述	   : GPIO操作文件。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">其他	   : 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">论坛 	   : www.wtmembed.com</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">日志	   : 初版V1.0 2019/1/4 左忠凯创建</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		 V2.0 2019/1/4 左忠凯修改:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		 修改gpio_init()函数，支持中断配置.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		 添加gpio_intconfig()函数，初始化中断</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		 添加gpio_enableint()函数，使能中断</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		 添加gpio_clearintflags()函数，清除中断标志位</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		 </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">***************************************************************/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description		: GPIO初始化。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - base	: 要初始化的GPIO组。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - pin		: 要初始化GPIO在组内的编号。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - config	: GPIO配置结构体。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 			: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">gpio_pin_config_t</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	base-&gt;IMR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(config-&gt;direction </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> kGPIO_DigitalInput</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> /* GPIO作为输入 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		base-&gt;GDIR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">( </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	else</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">										/* 输出 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		base-&gt;GDIR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">		gpio_pinwrite</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(base,pin, config-&gt;outputLogic);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 设置默认输出电平 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	gpio_intconfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(base, pin, config-&gt;interruptMode);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 中断功能配置 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description	 : 读取指定GPIO的电平值 。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - base	 : 要读取的GPIO组。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - pin	 : 要读取的GPIO脚号。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 		 : 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_pinread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	 return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (((base-&gt;DR) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> 0x</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description	 : 指定GPIO输出高或者低电平 。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - base	 : 要输出的的GPIO组。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - pin	 : 要输出的GPIO脚号。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - value	 : 要输出的电平，1 输出高电平， 0 输出低低电平</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 		 : 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_pinwrite</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	 if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	 {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		 base-&gt;DR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> /* 输出低电平 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	 }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	 else</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	 {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		 base-&gt;DR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> /* 输出高电平 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	 }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description  			: 设置GPIO的中断配置功能</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - base 			: 要配置的IO所在的GPIO组。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - pin  			a: 要配置的GPIO脚号。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - pinInterruptMode: 中断模式，参考枚举类型gpio_interrupt_mode_t</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return		 			: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_intconfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">gpio_interrupt_mode_t</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin_int_mode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	volatile</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> uint32_t</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">icr;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	uint32_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> icrShift;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	icrShift </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	base-&gt;EDGE_SEL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pin </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 	/* 低16位 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		icr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(base-&gt;ICR1);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	else</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">			/* 高16位 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		icr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(base-&gt;ICR2);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		icrShift </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	switch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(pin_int_mode)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">kGPIO_IntLowLevel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">):</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">icr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> icrShift));</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">kGPIO_IntHighLevel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">):</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">icr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">icr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> icrShift)))) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> icrShift));</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">kGPIO_IntRisingEdge</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">):</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">icr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">icr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> icrShift)))) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> icrShift));</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">kGPIO_IntFallingEdge</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">):</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">icr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> icrShift));</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		case</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">kGPIO_IntRisingOrFallingEdge</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">):</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">			base-&gt;EDGE_SEL </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">U</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description  			: 使能GPIO的中断功能</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - base 			: 要使能的IO所在的GPIO组。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - pin  			: 要使能的GPIO在组内的编号。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return		 			: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_enableint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    base-&gt;IMR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description  			: 禁止GPIO的中断功能</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - base 			: 要禁止的IO所在的GPIO组。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - pin  			: 要禁止的GPIO在组内的编号。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return		 			: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_disableint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    base-&gt;IMR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description  			: 清除中断标志位(写1清除)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - base 			: 要清除的IO所在的GPIO组。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param - pin  			: 要清除的GPIO掩码。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return		 			: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio_clearintflags</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO_Type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> base</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> pin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    base-&gt;ISR </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> pin);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></details><ul><li><p>添加 exit 文件夹</p><p>在此文件下创建 bsp_exit.c 和 bsp_exit.h 文件</p></li></ul><details><summary>bsp_exit.c</summary><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/***************************************************************</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">文件名	: 	 bsp_exit.c</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">作者	   : 左忠凯</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">版本	   : V1.0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">描述	   : 外部中断驱动。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">其他	   : 配置按键对应的GPIP为中断模式</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">论坛 	   : www.wtmembed.com</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">日志	   : 初版V1.0 2019/1/4 左忠凯创建</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">***************************************************************/</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_exit.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_gpio.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_int.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_delay.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_beep.h&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description			: 初始化外部中断</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param				: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 				: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> exit_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">	gpio_pin_config_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> key_config;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 1、设置IO复用 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	IOMUXC_SetPinMux</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IOMUXC_UART1_CTS_B_GPIO1_IO18,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">			/* 复用为GPIO1_IO18 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	IOMUXC_SetPinConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IOMUXC_UART1_CTS_B_GPIO1_IO18,</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">0x</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">F080</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 2、初始化GPIO为中断模式 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	key_config.direction </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> kGPIO_DigitalInput</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	key_config.interruptMode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> kGPIO_IntFallingEdge</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	key_config.outputLogic </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	gpio_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO1, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">18</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">key_config);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	GIC_EnableIRQ</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO1_Combined_16_31_IRQn);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">				/* 使能GIC中对应的中断 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	system_register_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO1_Combined_16_31_IRQn, (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">system_irq_handler_t</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)gpio1_io18_irqhandler, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 注册中断服务函数 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	gpio_enableint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO1, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">18</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">								/* 使能GPIO1_IO18的中断功能 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @description			: GPIO1_IO18最终的中断处理函数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @param				: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * @return 				: 无</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio1_io18_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{ </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> state </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	 *采用延时消抖，中断服务函数中禁止使用延时函数！因为中断服务需要</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	 *快进快出！！这里为了演示所以采用了延时函数进行消抖，后面我们会讲解</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	 *定时器中断消抖法！！！</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 	 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	delay</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gpio_pinread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO1, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">18</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 按键按下了  */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		state </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">state;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">		beep_switch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(state);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	gpio_clearintflags</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(GPIO1, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">18</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> /* 清除中断标志位 */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></details><details><summary>bsp_exit.h</summary><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#ifndef</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> _BSP_EXIT_H</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#define</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> _BSP_EXIT_H</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/***************************************************************</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">Copyright © zuozhongkai Co., Ltd. 1998-2019. All rights reserved.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">文件名	: 	 bsp_exit.c</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">作者	   : 左忠凯</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">版本	   : V1.0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">描述	   : 外部中断驱动头文件。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">其他	   : 配置按键对应的GPIP为中断模式</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">论坛 	   : www.wtmembed.com</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">日志	   : 初版V1.0 2019/1/4 左忠凯创建</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">***************************************************************/</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;imx6ul.h&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* 函数声明 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> exit_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">						/* 中断初始化 */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> gpio1_io18_irqhandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 			/* 中断处理函数 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#endif</span></span></code></pre></div></details><ul><li>修改 main.c 文件</li></ul><details><summary>main.c</summary><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_clk.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_delay.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_led.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_beep.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_key.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_int.h&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;bsp_exit.h&quot;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 点灯步骤</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 1. 使能GPIO时钟</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 2. 设置GPIO复用功能</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 3. 配置GPIO的电气属性</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 4. 设置GPIO的输出模式</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 5. 将 GPIO 对应的灯置 高/低 电平</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	unsigned</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> char</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> state </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OFF;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	int_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 		/* 初始化中断(一定要最先调用！) */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	imx6u_clkinit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	/* 初始化系统时钟 			*/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	clk_enable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		/* 使能所有的时钟 			*/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	led_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">			/* 初始化led 			*/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	beep_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		/* 初始化beep	 		*/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	key_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">			/* 初始化key 			*/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">	exit_init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		/* 初始化按键中断			*/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)			</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	{	</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		state </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">state;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">		led_switch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(LED0, state);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">		delay</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">500</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></details><h2 id="修改-makefile-文件" tabindex="-1">修改 Makefile 文件 <a class="header-anchor" href="#修改-makefile-文件" aria-label="Permalink to &quot;修改 Makefile 文件&quot;">​</a></h2><p>修改生成的目标文件为 int ， 添加 int 和 exit 的路径即可</p><div class="language-makefile vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">makefile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TARGET		  	?= int</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				   bsp/exit </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				   bsp/int</span></span></code></pre></div><h2 id="编译下载" tabindex="-1">编译下载 <a class="header-anchor" href="#编译下载" aria-label="Permalink to &quot;编译下载&quot;">​</a></h2><p>编译下载后验证，效果应该和上一节的内容一致，不过实现效果改为了中断</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ls</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /dev/sd</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">*</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./imxdownload</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> int.bin</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /dev/sdb</span></span></code></pre></div>`,28)])])}const y=i(l,[["render",t]]);export{g as __pageData,y as default};

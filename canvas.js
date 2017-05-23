$(document).ready(function(){
	/*菜单*/
	$(".top a").click(function(){
		$(".top a").removeClass("selected").end().find($(this)).addClass("selected");
		$("ul.menu").hide();
		$("ul.menu").eq($(".top a").index(this)).show();
	})
	$("ul.menu li").click(function(){
		$("ul.menu li").removeClass().end().find($(this)).addClass("first");
	})
	
	/*画图*/
	var canvas=document.getElementById('myCanvas');
	var cobj=canvas.getContext('2d'); /*获取canvas的2d绘画环境*/
	var copy=document.getElementsByClassName('copy')[0]; /*取到的是集合*/
	var obj=new shape(canvas,copy,cobj);
	
	
//	obj.style="fill";
//	obj.type="jiao";
//	obj.fillStyle="blue";
//	obj.pen();
//	obj.draw();
	
	/*画什么图*/
	$("ul.menu:eq(1) li").click(function(){
		if($(this).attr("data-role")=="pebn bn n"){
			obj.pen();
		}else{
			obj.type=$(this).attr("data-role");
			if($(this).attr("data-role")=="bian"){
				obj.bianNum=prompt("请输入边数",5);
			}
			if($(this).attr("data-role")=="jiao"){
				obj.jiaoNum=prompt("请输入角数",5);
			}
			obj.draw();
		}
	})
	
	/*设置颜色*/
	/*change事件：当值发生改变且失去焦点的时候触发*/
	$("ul.menu:eq(2) li input").change(function(){
		obj[$(this).attr("data-role")]=$(this).val();
	})
	
	/*画图方式--填充还是不填充*/
	$("ul.menu:eq(3) li").click(function(){
		obj.style=$(this).attr("data-role");
	})
	
	/*线条宽度*/
	$("ul.menu:eq(4) li").click(function(){
		obj.lineWidth=$(this).attr("data-role");
	})
	$("ul.menu:eq(4) input")[0].oninput=function(){
		obj.lineWidth=$(this).val();
	}
	
	/*橡皮擦
	 1.视觉实现  div
	 2.
	 * */
	var eraser=$(".eraser");
	console.log(eraser)
	$(".eraserOpt").click(function(){
		obj.eraser(eraser);
	})
	
	/*消除橡皮擦*/
	$(".top a:not(.eraserOpt)").click(function(){
		//console.log($(".top a:not(eraserOpt)"))
		$(".eraser").css("display","none");
		copy.onmousemove=null;
		copy.onmousedown=null;
	})
	/*oninput 输入即触发，用原生方法写，jquery对象要转为dom对象*/
	$(".menu:eq(5) input")[0].oninput=function(){
		obj.xpw=$(this).val();
		obj.xph=$(this).val();
		$(".eraser").css({
			width:obj.xpw,
			height:obj.xph
		})
	}
	
	/*文件*/
	$(".menu:first li").click(function(){
		var index=$(this).index(".menu:first li");
		
		/*新建*/
		if(index==0){
			if(obj.historyArr.length>0){
				var yes=confirm("是否要保存");
				if(yes){
					location.href=canvas.toDataURL().replace("data:image/jpeg", "data:stream/octet");
				}
				cobj.clearRect(0,0,canvas.width,canvas.height);
				obj.historyArr=[];
			}
		}
		
		/*返回*/
		/*
		 1.查看是否有历史记录：
		 	1）如果有，
		 		①有一个，加标识，删除
		 		②大于一个，删除，记录
	 		2）如果没有
	 			有零个，清除画布，弹出提示信息
		 * */
		if(index==1){ 
			if(obj.historyArr.length==0){ /*一个等号是赋值，两个等号是等于*/
				cobj.clearRect(0,0,canvas.width,canvas.height);
				setTimeout(function(){	/*创建异步线程，执行完正常线程的再来执行它*/				
					alert("没有历史记录");
				},100)
			}else{
				if(obj.firstBack){
					if(obj.historyArr.length==1){
						obj.historyArr.pop();
						cobj.clearRect(0,0,canvas.width,canvas.height);					
					}
					obj.historyArr.pop();
					cobj.putImageData(obj.historyArr.pop(),0,0);  /*把图像数据放回画布*/
				}else{
					cobj.putImageData(obj.historyArr.pop(),0,0);				
				}
				obj.firstBack=false;				
			}
		}
		
		/*保存*/
		if(index==2){
			location.href=canvas.toDataURL().replace("data:image/jpeg", "data:stream/octet");
		}
		
		/*重置*/
		if(index==3){
           obj.lineWidth=1;
           obj.fillStyle="#000";
           obj.strokeStyle="#000";
           obj.style="stroke";
           obj.type="line";
       }
		
		
		/*图片上传*/
		if(index==4){
			$("input[type=file]").change(function(){
				var imgdata=this.files[0];
				//console.log(imgdata);
				var read=new FileReader();
				//console.log(read);
				read.readAsDataURL(imgdata);
				read.onload=function(e){
					var img=document.createElement("img");
					img.src=e.target.result;
					cobj.drawImage(img,0,0);
				}
			})
		}
	})
	
	/*滤镜*/
	/*反相*/
	function fx(data){
		for(var i=0;i<data.width*data.height;i++){
			data.data[i*4+0]=255-data.data[i*4+0];
			data.data[i*4+1]=255-data.data[i*4+1];
			data.data[i*4+2]=255-data.data[i*4+2];
			data.data[i*4+3]=255;
		}
		return data;
	}
	$(".menu:nth-child(7) li:nth-child(1)").click(function(){
		var data=cobj.getImageData(0,0,canvas.width,canvas.height);
		cobj.putImageData(fx(data),0,0);		
	})
	
	/*高斯模糊*/


	/*文字*/
	function wrap(text,initx,inity,width,height){
		var str=text;
		var x=initx;

		for(var i =0;i<str.length;i++){
			cobj.fillText(str[i],initx,inity);
			initx+=cobj.measureText(str[i]).width;
			if(initx>x+width){
				initx=x;
				inity+=height;
			}

		}
	}

	var ox,oy;
	var flag=true;
	$(".text").click(function(){
		copy.onmousedown=function(e){
			if(!flag){
				return;
			}
			flag=false;
			ox=e.offsetX;
			oy=e.offsetY;


			$(".area").css("display","block").css({left:ox,top:oy});

			setTimeout(function(){
				$(".area").focus();
			},0)

		}
	})

	var width=$(".area").width();

	$(".area").blur(function(){
		var val=$(this).val();
		wrap(val,ox,oy,width,20);
		$(".area").val("").css("display","none");
		flag=true;

	})
})

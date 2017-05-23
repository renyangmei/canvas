	function shape(canvas,copy,cobj){
		if(canvas==undefined||cobj==undefined){
			console.error("请输入正确的参数");
			return false;
		}
		this.canvas=canvas;
		this.copy=copy;
		this.cobj=cobj;
		this.style="stroke"; /*填充还是不填充 可以传入stroke，fill*/
		this.type="line" 	 /*画线还是画多边形，多角形*/
		this.strokeStyle="#000";
		this.fillStyle="#000";
		this.lineWidth=1;
		this.historyArr=[];
		this.bianNum=5;
		this.jiaoNum=5;
		this.xpw=10;
		this.xph=10;
		this.fistBack=true;
	}
	shape.prototype={
		init:function(){
			this.cobj.strokeStyle=this.strokeStyle;
			this.cobj.fillStyle=this.fillStyle;
			this.cobj.lineWidth=this.lineWidth;
//			this.firstBack=true;
		},
		draw:function(){
			var that=this;
			that.copy.onmousedown=function(e){
				this.firstBack=true;
				that.init();
				var startx=e.offsetX;
				var starty=e.offsetY;
				that.copy.onmousemove=function(e){
					var endx=e.offsetX;
					var endy=e.offsetY;
					that.cobj.clearRect(0,0,that.canvas.width,that.canvas.height);/*在画当前线之前要清空所有的线*/
					if(that.historyArr.length>0){
						that.cobj.putImageData(that.historyArr[that.historyArr.length-1],0,0);
					}
					that[that.type](startx,starty,endx,endy);
				}
				that.copy.onmouseup=function(){
					that.historyArr.push(that.cobj.getImageData(0,0,that.canvas.width,that.canvas.height));
					that.copy.onmousemove=null;
					that.copy.onmouseup=null;
				}
			}				
		},
		//线
		line:function(x1,y1,x2,y2){
			this.cobj.beginPath();
			this.cobj.moveTo(x1,y1);
			this.cobj.lineTo(x2,y2);
			this.cobj.stroke(); /*绘制到页面*/
		},
		//矩形
		rect:function(x1,y1,x2,y2){
			this.cobj.beginPath();
			this.cobj.rect(x1,y1,x2-x1,y2-y1);
			this.cobj[this.style]();
		},
		//圆
		arc:function(x1,y1,x2,y2){
			this.cobj.beginPath();
			var r=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1))/2;
			this.cobj.arc(x1,y1,r,0,360*Math.PI/180);
			this.cobj[this.style]();
		},
		//多边形
		bian:function(x1,y1,x2,y2){
			this.cobj.beginPath();
			var angle=360/this.bianNum*Math.PI/180;		//角度
			var r=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));  //半径：勾股定理
			for(var i=0;i<this.bianNum;i++){
				var x=x1+Math.cos(angle*i)*r;
				var y=y1+Math.sin(angle*i)*r;		
				this.cobj.lineTo(x,y);
			}
			this.cobj.closePath();
			this.cobj[this.style]();
		},
		//多角形
		jiao:function(x1,y1,x2,y2){
			var angle=360/(this.jiaoNum*2)*Math.PI/180 /*每个角占的弧度  几边形就是几个角，只要确定点，连起来就可以，每个多角形的点都是角数*2   转化为弧度需要*π/180*/
			var r=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));  //半径：勾股定理
			var r1=r/3;
			this.cobj.beginPath();
			for(var i=0;i<this.jiaoNum*2;i++){
				if(i%2==0){
					this.cobj.lineTo(x1+Math.cos(angle*i)*r,y1+Math.sin(angle*i)*r);
				}else{
					this.cobj.lineTo(x1+Math.cos(angle*i)*r1,y1+Math.sin(angle*i)*r1);
				}
			}
			this.cobj.closePath();
			this.cobj[this.style]();
		},
		//笔
		pen:function(){
			var that=this;
			that.copy.onmousedown=function(e){
				var startx=e.offsetX;
				var starty=e.offsetY;
				that.cobj.beginPath();
				that.cobj.moveTo(startx,starty);
				that.copy.onmousemove=function(e){
					that.init();
					var endx=e.offsetX;
					var endy=e.offsetY;
					that.cobj.clearRect(0,0,that.width,that.height);/*在画当前线之前要清空所有的线*/
					if(that.historyArr.length>0){
						that.cobj.putImageData(that.historyArr[that.historyArr.length-1],0,0);
					}
					that.cobj.lineTo(endx,endy);
					that.cobj.stroke();
				}
				that.copy.onmouseup=function(){
					that.historyArr.push(that.cobj.getImageData(0,0,that.canvas.width,that.canvas.height));
					that.copy.onmousemove=null;
					that.copy.onmouseup=null;
				}
			}
		},
		eraser:function(ele){
			var that=this;
			that.copy.onmousemove=function(e){
				var movex=e.offsetX;
				var movey=e.offsetY;
				var x=movex-that.xpw/2;
				var y=movey-that.xph/2;
				/*边界判断*/
				if(x<0){
					x=0;
				}
				if(x>$(that.copy).width()-that.xpw){
					x=$(that.copy).width()-that.xpw;
				}
				if(y<0){
					y=0;
				}
				if(y>$(that.copy).height()-that.xph){
					y=$(that.copy).height()-that.xph;
				}
				ele.css("display","block").css("left",x).css("top",y).css({
					width:that.xpw,
					height:that.xph
				});
			}
			that.copy.onmousedown=function(){
				that.copy.onmousemove=function(e){
					var movex=e.offsetX;
					var movey=e.offsetY;
					var x=movex-that.xpw/2;
					var y=movey-that.xph/2;
					/*边界判断*/
					if(x<0){
						x=0;
					}
					if(x>$(that.copy).width()-that.xpw){
						x=$(that.copy).width()-that.xpw;
					}
					if(y<0){
						y=0;
					}
					if(y>$(that.copy).height()-that.xph){
						y=$(that.copy).height()-that.xph;
					}
					ele.css("left",x).css("top",y);
					that.cobj.clearRect(x,y,that.xpw,that.xph);
				}
				that.copy.onmouseup=function(){
					that.historyArr.push(that.cobj.getImageData(0,0,that.canvas.width,that.canvas.height));
					that.copy.onmousemove=null;
					that.copy.onmouseup=null;
					that.eraser(ele);
				}
			}	
		}
	}

	
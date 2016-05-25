
function linearFit2D() {
    
    function Model(xa,xb,ya,yb) {
        this.x = {a: xa || 1, b: xb || 0};
        this.y = {a: ya || 1, b: yb || 0};
    }
    
    function* generateSamples(n) {
        var x0,x1,x2;
        for(x0 = 0; x0 < n-2; x0++) {
            for(x1 = x0+1; x1 < n-1; x1++) {
                for(x2 = x1+1; x2 < n; x2++) {
                    yield [x0,x1,x2];
                }
            }
        }
    }
    
    function estimateModel(sample) {
        
        var Bx, By;
        var preprocess = [];
        var avg = {}
        var sum = {}
        var n = sample.length;
        
        sum.point1 = sample.reduce((a,b) => { 
            return {
                x: a.x + b.point1.x, 
                y: a.y + b.point1.y
            }
        },{x:0,y:0});
        sum.point2 = sample.reduce((a,b) => { 
            return {x: a.x + b.point2.x, y: a.y + b.point2.y}
        },{x:0,y:0});
        sum.point1point1 = sample.reduce((a,b) => { 
            return {
                x: a.x + b.point1.x * b.point1.x, 
                y: a.y + b.point1.y * b.point1.y
            }
        },{x:0,y:0});
        sum.point1point2 = sample.reduce((a,b) => { 
            return {
                x: a.x + b.point1.x * b.point2.x, 
                y: a.y + b.point1.y * b.point2.y
            }
        },{x:0,y:0});
        sum.point2point2 = sample.reduce((a,b) => { 
            return {
                x: a.x + b.point2.x * b.point2.x, 
                y: a.y + b.point2.y * b.point2.y
            }
        },{x:0,y:0});

        avg.point1 = {x:sum.point1.x / n, y:sum.point1.y / n};
        avg.point2 = {x:sum.point2.x / n, y:sum.point2.y / n};
        
        Bx = (1/2) * ((sum.point2.x - n * sum.point2point2.x)-(sum.point1.x - n * sum.point1point1.x))/(n*sum.point1.x*sum.point2.x - sum.point1point2.x);
        By = (1/2) * ((sum.point2.y - n * sum.point2point2.y)-(sum.point1.y - n * sum.point1point1.y))/(n*sum.point1.y*sum.point2.y - sum.point1point2.y);
        var xap = -Bx + Math.sqrt(Bx*Bx + 1);
        var xbp = (sum.point2.x - xap * sum.point1.x) / n;
        var yap = -By + Math.sqrt(By*By + 1);
        var ybp = (sum.point2.y - yap * sum.point1.y) / n;

        return new Model(xap,xbp,yap,ybp);
    }
    
    function sampleError(point, model) {
        console.log("sampleError:", point, model);
        
        // the model, in Ax + By + C == 0
        // y = ax + b
        var A = model.a;
        var B = -1; 
        var C = model.b
        
        return Math.abs(A*point.x + B * point.y + C)/ Math.sqrt(A*A + B*B);
    }
    
    function sampleError(point, model) {

        var dx = Math.abs(point.point2.x - model.x.a * point.point1.x - model.x.b) / Math.sqrt(1 + model.x.a * model.x.a);
        var dy = Math.abs(point.point2.y - model.y.a * point.point1.y - model.y.b) / Math.sqrt(1 + model.y.a * model.y.a);

        return Math.sqrt(dx * dx + dy * dy);
    }
    
    function refine(inliers, model) {
        return estimateModel(inliers);
    }
    
    function adjustScore(score, model){
        
        var aspectxy = model.x.a / model.y.a;
        var aspectyx = model.y.a / model.x.a;
        var aspect = aspectxy > aspectyx ? aspectxy : aspectyx;
        
        return score * aspect;
    }
    
    return {
        
        k: 3,
        Model: Model,
        estimateModel: estimateModel,
        sampleError: sampleError,
        refine: refine,
        generateSamples: generateSamples
    } 
    
}

module.exports = linearFit2D();

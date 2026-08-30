require("dotenv").config();
const express=require("express"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const app=express(),PORT=process.env.PORT||3000;
const USER=process.env.ADMIN_USER||"owner", PASS=process.env.ADMIN_PASSWORD||"ChangeThisToYourPrivatePassword";
const SECRET=process.env.SESSION_SECRET||"change-this-secret";
const file=path.join(__dirname,"data","leads.json");
if(!fs.existsSync(file))fs.writeFileSync(file,"[]");
const sessions=new Map();
app.use(express.json());
function token(){const raw=crypto.randomBytes(32).toString("hex"),sig=crypto.createHmac("sha256",SECRET).update(raw).digest("hex");sessions.set(sig,Date.now()+28800000);return sig}
function auth(req,res,next){const t=(req.headers.authorization||"").replace("Bearer ",""),e=sessions.get(t);if(!e||e<Date.now())return res.status(401).json({message:"Login required"});next()}
app.post("/api/leads",(req,res)=>{const {name,phone,service,area,address,problem=""}=req.body;if(!name||!phone||!service||!area||!address)return res.status(400).json({message:"Required fields missing"});const a=JSON.parse(fs.readFileSync(file));const lead={id:"APL-"+Date.now(),name,phone,service,area,address,problem,status:"New",createdAt:new Date().toISOString()};a.push(lead);fs.writeFileSync(file,JSON.stringify(a,null,2));res.status(201).json({success:true,leadId:lead.id})});
app.post("/api/admin/login",(req,res)=>{if(req.body.username!==USER||req.body.password!==PASS)return res.status(401).json({message:"Invalid username or password"});res.json({success:true,token:token()})});
app.post("/api/admin/logout",auth,(req,res)=>{sessions.delete((req.headers.authorization||"").replace("Bearer ",""));res.json({success:true})});
app.get("/api/admin/leads",auth,(req,res)=>res.json(JSON.parse(fs.readFileSync(file)).reverse()));
app.patch("/api/admin/leads/:id",auth,(req,res)=>{const ok=["New","Contacted","Assigned","Completed","Cancelled"];if(!ok.includes(req.body.status))return res.status(400).json({message:"Invalid status"});const a=JSON.parse(fs.readFileSync(file)),l=a.find(x=>x.id===req.params.id);if(!l)return res.status(404).json({message:"Lead not found"});l.status=req.body.status;fs.writeFileSync(file,JSON.stringify(a,null,2));res.json({success:true})});
app.use(express.static(__dirname));
app.listen(PORT,()=>console.log("Applenza running on http://localhost:"+PORT));
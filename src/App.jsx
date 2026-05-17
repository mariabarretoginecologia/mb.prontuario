import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

import LOGO_B64 from "./logo.js";
const LOGO = ;

const C = {
  teal:"#2E7D8C",tl:"#E8F4F6",tm:"#B2D8DF",td:"#1d5c68",
  amber:"#C0620A",al:"#FDF3E7",ab:"#F0C080",
  violet:"#6B3FA0",vl:"#F0EBF8",vm:"#C5A8E0",vb:"#B490D4",
  olive:"#5a6b20",olive2:"#3d4a15",oliveL:"#eef1e6",oliveM:"#c8d4a0",
  dark:"#1a1a1a",gray:"#555",gl:"#dde2e6",w:"#fff",
  aiBg:"#0f172a",aiAcc:"#6366f1",aiBdr:"#1e293b",
};

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function today(){ return new Date().toLocaleDateString("pt-BR"); }

// ── BASE COMPONENTS ──────────────────────────────────────────────────────────
function Label({children}){ return <div style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:"uppercase",letterSpacing:.3,marginBottom:3}}>{children}</div>; }

function FInput({label,value,onChange,color,placeholder}){
  const bdr=color==="a"?C.ab:color==="v"?C.vb:C.tm;
  const fc=color==="a"?C.amber:color==="v"?C.violet:C.teal;
  const bg=color==="a"?C.al:color==="v"?C.vl:C.tl;
  return(
    <div style={{display:"flex",flexDirection:"column"}}>
      {label&&<Label>{label}</Label>}
      <input type="text" value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder||""}
        style={{border:"none",borderBottom:`1.5px solid ${bdr}`,background:"transparent",fontSize:13,color:C.dark,padding:"3px 2px",outline:"none",fontFamily:"inherit",width:"100%"}}
        onFocus={e=>{e.target.style.borderBottomColor=fc;e.target.style.background=bg}}
        onBlur={e=>{e.target.style.borderBottomColor=bdr;e.target.style.background="transparent"}}/>
    </div>
  );
}

function FArea({label,value,onChange,rows=3,color}){
  const bdr=color==="a"?C.ab:color==="v"?C.vb:C.tm;
  const fc=color==="a"?C.amber:color==="v"?C.violet:C.teal;
  return(
    <div style={{display:"flex",flexDirection:"column"}}>
      {label&&<Label>{label}</Label>}
      <textarea rows={rows} value={value||""} onChange={e=>onChange(e.target.value)}
        style={{resize:"vertical",border:`1.5px solid ${bdr}`,borderRadius:4,padding:"6px 8px",fontSize:13,color:C.dark,fontFamily:"inherit",width:"100%",outline:"none"}}
        onFocus={e=>e.target.style.borderColor=fc} onBlur={e=>e.target.style.borderColor=bdr}/>
    </div>
  );
}

function ObsField({value,onChange,color}){
  const acc=color==="a"?C.amber:color==="v"?C.violet:C.teal;
  const bg=color==="a"?C.al:color==="v"?"#f5f0ff":C.tl;
  return(
    <div style={{marginTop:8,background:bg,borderLeft:`3px solid ${acc}`,borderRadius:"0 4px 4px 0",padding:"8px 10px"}}>
      <FArea label="📝 Observações adicionais" value={value} onChange={onChange} rows={2} color={color}/>
    </div>
  );
}

function SC({color,title,children}){
  const bg=color==="a"?C.amber:color==="v"?C.violet:C.teal;
  return(
    <div style={{marginTop:16,borderRadius:7,overflow:"hidden",border:`1px solid ${C.gl}`}}>
      <div style={{background:bg,color:"#fff",fontSize:11,fontWeight:700,letterSpacing:.7,textTransform:"uppercase",padding:"8px 15px"}}>{title}</div>
      <div style={{padding:"13px 15px"}}>{children}</div>
    </div>
  );
}

function ST({color,children}){
  const c=color==="a"?C.amber:color==="v"?C.violet:C.teal;
  const b=color==="a"?C.ab:color==="v"?C.vm:C.tm;
  return <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,borderBottom:`2px solid ${b}`,paddingBottom:4,marginBottom:8,color:c,marginTop:12}}>{children}</div>;
}

function DV(){ return <div style={{height:1,background:C.gl,margin:"12px 0"}}/>; }
function G2({children}){ return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>{children}</div>; }
function G3({children}){ return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>{children}</div>; }
function G4({children}){ return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:9}}>{children}</div>; }

function Radio({name,options,value,onChange}){
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",padding:"2px 0"}}>
      {options.map(o=>(
        <label key={o} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:12}}>
          <input type="radio" name={name} checked={value===o} onChange={()=>onChange(o)} style={{accentColor:C.teal}}/> {o}
        </label>
      ))}
    </div>
  );
}

function Check({label,checked,onChange,color}){
  const acc=color==="a"?C.amber:color==="v"?C.violet:C.teal;
  return(
    <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12}}>
      <input type="checkbox" checked={!!checked} onChange={e=>onChange(e.target.checked)} style={{accentColor:acc}}/> {label}
    </label>
  );
}

function MR({label,name,options,value,onChange,extra}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",padding:"5px 0",borderBottom:`1px solid ${C.gl}`}}>
      <span style={{fontSize:11,fontWeight:700,color:C.gray,minWidth:140,flexShrink:0}}>{label}</span>
      <Radio name={name} options={options} value={value} onChange={onChange}/>
      {extra}
    </div>
  );
}

function InlineInput({value,onChange,borderColor,width=110}){
  return <input type="text" value={value||""} onChange={e=>onChange(e.target.value)}
    style={{border:"none",borderBottom:`1px solid ${borderColor}`,width,fontFamily:"inherit",fontSize:12,outline:"none",background:"transparent"}}/>;
}

function Sig(){ return(
  <div style={{textAlign:"center",marginTop:28,paddingTop:14,borderTop:`1px solid ${C.gl}`}}>
    <span style={{display:"inline-block",width:300,borderTop:`1.5px solid ${C.gray}`,paddingTop:6,fontSize:11,color:C.gray,letterSpacing:.4}}>
      Dra. Maria Barreto · CRM-DF 34683 · CRM-SP 231293
    </span>
  </div>
);}

function RetornoBar({color,value,onChange}){
  const bg=color==="a"?C.al:color==="v"?C.vl:C.tl;
  const bdr=color==="a"?C.ab:color==="v"?C.vb:C.tm;
  const lc=color==="a"?C.amber:color==="v"?C.violet:C.td;
  const ic=color==="a"?C.amber:color==="v"?C.violet:C.teal;
  return(
    <div style={{background:bg,border:`1.5px solid ${bdr}`,borderRadius:7,padding:"11px 18px",display:"flex",alignItems:"center",gap:11,marginTop:14}}>
      <label style={{fontWeight:700,fontSize:12,color:lc,whiteSpace:"nowrap"}}>Retorno previsto em:</label>
      <input type="text" value={value||""} onChange={e=>onChange(e.target.value)}
        style={{flex:1,border:"none",borderBottom:`1.5px solid ${ic}`,background:"transparent",fontSize:14,fontFamily:"inherit",outline:"none",padding:"3px 4px"}}/>
    </div>
  );
}

function MedTable({rows=5,prefix,color,d,set}){
  const bg=color==="a"?C.al:color==="v"?C.vl:C.tl;
  const bc=color==="a"?C.ab:color==="v"?C.vm:C.tm;
  const tc=color==="a"?C.amber:color==="v"?C.violet:C.teal;
  return(
    <table style={{width:"100%",borderCollapse:"collapse",marginTop:7,fontSize:12}}>
      <thead><tr>
        {["Medicamento / Hormônio / Fitoterápico","Dose / Via","Observação"].map((h,i)=>(
          <th key={i} style={{background:bg,color:tc,fontWeight:700,padding:"7px 9px",border:`1px solid ${bc}`,fontSize:10,textTransform:"uppercase",letterSpacing:.3,textAlign:"left",width:i===0?"40%":"30%"}}>{h}</th>
        ))}
      </tr></thead>
      <tbody>{Array.from({length:rows},(_,i)=>(
        <tr key={i}>{["n","d","o"].map(k=>(
          <td key={k} style={{border:`1px solid ${C.gl}`,padding:"4px 8px"}}>
            <input type="text" value={d[`${prefix}${i}_${k}`]||""} onChange={e=>set(`${prefix}${i}_${k}`,e.target.value)}
              style={{border:"none",background:"transparent",width:"100%",fontSize:12,fontFamily:"inherit",outline:"none"}}/>
          </td>
        ))}</tr>
      ))}</tbody>
    </table>
  );
}

function Checklist({items,prefix,color,d,set}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {items.map(l=>(
        <Check key={l} label={l} checked={d[`${prefix}${l}`]} onChange={v=>set(`${prefix}${l}`,v)} color={color}/>
      ))}
    </div>
  );
}

// ── MODAL PACIENTE ────────────────────────────────────────────────────────────
function PatientModal({patients,onSelect,onClose,onDelete}){
  const [search,setSearch]=useState("");
  const [confirmDelete,setConfirmDelete]=useState(null);
  const filtered=patients.filter(p=>
    (p.nome||"").toLowerCase().includes(search.toLowerCase())||(p.cpf||"").includes(search)
  );
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:12,width:480,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.gl}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontWeight:700,fontSize:15,color:C.dark}}>Selecionar Paciente</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.gray,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.gl}`}}>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome ou CPF..."
            style={{width:"100%",padding:"8px 12px",border:`1.5px solid ${C.tm}`,borderRadius:7,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px 12px"}}>
          {filtered.length===0&&<div style={{color:C.gray,fontSize:13,padding:16,textAlign:"center"}}>Nenhuma paciente encontrada.</div>}
          {filtered.map(p=>(
            <div key={p.id} style={{padding:"10px 12px",borderRadius:7,marginBottom:4,border:`1px solid ${C.gl}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div onClick={()=>onSelect(p)} style={{flex:1,cursor:"pointer"}}>
                <div style={{fontWeight:600,fontSize:13,color:C.dark}}>{p.nome||"(sem nome)"}</div>
                <div style={{fontSize:11,color:C.gray,marginTop:2}}>{p.data_nascimento} · CPF: {p.cpf} · {p.total_consultas||0} consulta(s)</div>
              </div>
              {confirmDelete===p.id ? (
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button onClick={()=>onDelete(p.id)} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Confirmar</button>
                  <button onClick={()=>setConfirmDelete(null)} style={{background:C.gl,color:C.dark,border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
                </div>
              ) : (
                <button onClick={e=>{e.stopPropagation();setConfirmDelete(p.id);}}
                  style={{background:"none",border:`1px solid #dc2626`,color:"#dc2626",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit",flexShrink:0,marginLeft:8}}>
                  🗑️ Deletar
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{padding:"12px 20px",borderTop:`1px solid ${C.gl}`}}>
          <button onClick={()=>onSelect(null)}
            style={{width:"100%",background:C.olive,color:"#fff",border:"none",borderRadius:7,padding:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            + Nova Paciente
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TAB 1 ─────────────────────────────────────────────────────────────────────
function Tab1({d,set}){
  const f=k=>v=>set(k,v);
  const chk=k=>v=>set(k,v);
  return(
    <div style={{padding:"0 28px 28px"}}>
      <SC color="t" title="1. Queixa Principal e HDA">
        <G2>
          <div style={{gridColumn:"1/-1"}}><FArea label="Queixa principal" value={d.qp} onChange={f("qp")} rows={2}/></div>
          <div style={{gridColumn:"1/-1"}}><FArea label="HDA — História da Doença Atual" value={d.hda} onChange={f("hda")} rows={3}/></div>
        </G2>
      </SC>

      <SC color="t" title="2. Antecedentes">
        <ST color="t">Ginecológicos e Obstétricos</ST>
        <G4>
          <FInput label="G" value={d.g} onChange={f("g")}/>
          <FInput label="P" value={d.p} onChange={f("p")}/>
          <FInput label="A" value={d.ab} onChange={f("ab")}/>
          <FInput label="C" value={d.cc} onChange={f("cc")}/>
          <FInput label="DUM" value={d.dum} onChange={f("dum")}/>
          <FInput label="Ciclo (dias)" value={d.cic} onChange={f("cic")}/>
          <FInput label="Duração (dias)" value={d.dur} onChange={f("dur")}/>
          <FInput label="Menopausa" value={d.men} onChange={f("men")}/>
        </G4>
        <G3 style={{marginTop:9}}>
          <FInput label="Último CCO" value={d.cco} onChange={f("cco")}/>
          <FInput label="Última mamografia" value={d.mamo} onChange={f("mamo")}/>
          <FInput label="Método contraceptivo" value={d.metodo} onChange={f("metodo")}/>
        </G3>
        <DV/>
        <ST color="t">Vida Sexual</ST>
        <G2>
          <div>
            <MR label="Atividade sexual" name="t1_as" options={["Ativa","Inativa"]} value={d.as} onChange={f("as")}/>
            <MR label="Dispareunia" name="t1_dis" options={["Não","Sim"]} value={d.dis} onChange={f("dis")}/>
            <MR label="Anorgasmia" name="t1_ano" options={["Não","Sim"]} value={d.ano} onChange={f("ano")}/>
          </div>
          <FArea label="Obs. vida sexual" value={d.sexobs} onChange={f("sexobs")} rows={3}/>
        </G2>
        <DV/>
        <ST color="t">Pessoais e Cirúrgicos</ST>
        <G2>
          <FArea label="Comorbidades" value={d.comor} onChange={f("comor")} rows={2}/>
          <FArea label="Cirurgias prévias" value={d.cirp} onChange={f("cirp")} rows={2}/>
          <FArea label="Medicamentos em uso" value={d.meds} onChange={f("meds")} rows={2}/>
          <FInput label="Alergias" value={d.aler} onChange={f("aler")}/>
        </G2>
        <DV/>
        <ST color="t">Familiares</ST>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px",padding:"4px 0"}}>
          {["Ca mama","Ca ovário","Ca colo","DM","HAS","Osteoporose","TEV/TVP"].map(l=>(
            <Check key={l} label={l} checked={d["fam_"+l]} onChange={chk("fam_"+l)}/>
          ))}
        </div>
        <div style={{marginTop:8}}><FInput label="Outros antecedentes familiares" value={d.famout} onChange={f("famout")}/></div>
        <DV/>
        <ST color="t">Hábitos</ST>
        <G3>
          <div><MR label="Tabagismo" name="t1_tab" options={["Não","Sim","Ex"]} value={d.tab} onChange={f("tab")}/></div>
          <div><MR label="Etilismo" name="t1_etil" options={["Não","Ocasional","Regular"]} value={d.etil} onChange={f("etil")}/></div>
          <div><MR label="Atividade física" name="t1_af" options={["Sedentária","Ativa"]} value={d.af} onChange={f("af")}/></div>
        </G3>
      </SC>

      <SC color="t" title="3. Sintomas">
        <ST color="t">Urinários</ST>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px"}}>
          {["Urgência miccional","Incontinência de urgência","Incontinência de esforço","Noctúria","Disúria","ITU recorrente"].map(l=>(
            <Check key={l} label={l} checked={d["s_"+l]} onChange={chk("s_"+l)}/>
          ))}
        </div>
        <DV/>
        <ST color="t">Climatéricos</ST>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px"}}>
          {["Fogachos","Sudorese noturna","Insônia","Labilidade emocional","Ressecamento vaginal","Queda de libido","Ganho de peso","Queda de cabelo"].map(l=>(
            <Check key={l} label={l} checked={d["s_"+l]} onChange={chk("s_"+l)}/>
          ))}
        </div>
        <DV/>
        <ST color="t">Estéticos e Funcionais</ST>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px"}}>
          {["Assimetria labial","Volume labial aumentado","Exposição do clitóris","Flacidez vulvar","IU de esforço","IU de urgência","Sensação de prolapso","Dor/desconforto","Dificuldade com higiene","Interferência esportiva","Insatisfação estética","Impacto na autoestima","Impacto na vida sexual"].map(l=>(
            <Check key={l} label={l} checked={d["s_"+l]} onChange={chk("s_"+l)}/>
          ))}
        </div>
        <G2 style={{marginTop:9}}>
          <FInput label="Procedimentos estéticos prévios" value={d.pep} onChange={f("pep")}/>
          <FInput label="Cirurgias genitais prévias" value={d.cgp} onChange={f("cgp")}/>
        </G2>
      </SC>

      <SC color="t" title="4. Exame Físico">
        <ST color="t">Biometria e Sinais Vitais</ST>
        <div style={{fontSize:11,color:"#888",fontStyle:"italic",marginBottom:8}}>BEG, corada, hidratada, eupneica, orientada.</div>
        <G4>
          <FInput label="PA" value={d.pa} onChange={f("pa")}/>
          <FInput label="Peso (kg)" value={d.pes} onChange={f("pes")}/>
          <FInput label="Altura (m)" value={d.alt} onChange={f("alt")}/>
          <FInput label="IMC" value={d.imc} onChange={f("imc")}/>
        </G4>
        <G4 style={{marginTop:8}}>
          <FInput label="% Gordura" value={d.gor} onChange={f("gor")}/>
          <FInput label="% Massa magra" value={d.mm} onChange={f("mm")}/>
          <FInput label="Gordura visceral" value={d.gv} onChange={f("gv")}/>
          <FInput label="Resultado bioimpedância" value={d.bio} onChange={f("bio")}/>
        </G4>
        <ObsField value={d.obs_biometria} onChange={f("obs_biometria")}/>
        <DV/>
        <ST color="t">Mamas</ST>
        <MR label="Simetria" name="t1_ms" options={["Simétricas","Assimétricas"]} value={d.ms} onChange={f("ms")}/>
        <MR label="Nódulos" name="t1_no" options={["Sem nódulos","Nódulo palpável"]} value={d.no} onChange={f("no")}/>
        <MR label="Descarga papilar" name="t1_dp" options={["Negativa","Presente"]} value={d.dp} onChange={f("dp")}/>
        <MR label="Axilas" name="t1_ax" options={["Livres","Linfonodos palpáveis"]} value={d.ax} onChange={f("ax")}/>
        <MR label="Próteses mamárias" name="t1_pr" options={["Não","Sim"]} value={d.pr} onChange={f("pr")}/>
        <ObsField value={d.obs_mamas} onChange={f("obs_mamas")}/>
        <DV/>
        <ST color="t">Vulva</ST>
        <MR label="Trofismo vulvar" name="t1_tv" options={["Normotrófico","Hipotrofia","Atrofia"]} value={d.tv} onChange={f("tv")}/>
        <MR label="Clitóris" name="t1_cl" options={["Evidente","Não evidente"]} value={d.cl} onChange={f("cl")}/>
        <MR label="Assimetria labial" name="t1_al" options={["Ausente","Presente"]} value={d.al} onChange={f("al")}
          extra={<span style={{fontSize:11,color:C.gray,display:"flex",alignItems:"center",gap:4}}>Desc.: <InlineInput value={d.ald} onChange={f("ald")} borderColor={C.tm}/></span>}/>
        <MR label="Lesões aparentes" name="t1_le" options={["Ausentes","Presentes"]} value={d.le} onChange={f("le")}
          extra={<span style={{fontSize:11,color:C.gray,display:"flex",alignItems:"center",gap:4}}>Desc.: <InlineInput value={d.led} onChange={f("led")} borderColor={C.tm}/></span>}/>
        <MR label="Ref. bulbocavernoso" name="t1_rb" options={["Presente","Ausente"]} value={d.rb} onChange={f("rb")}/>
        <div style={{marginTop:8}}><Check label="📷 Fotodocumentação realizada" checked={d.fotovulva} onChange={chk("fotovulva")}/></div>
        <ObsField value={d.obs_vulva} onChange={f("obs_vulva")}/>
        <DV/>
        <ST color="t">Assoalho Pélvico — Perineometria</ST>
        <MR label="Tônus em repouso" name="t1_ton" options={["Normal","Hipotônico","Hipertônico"]} value={d.ton} onChange={f("ton")}/>
        <MR label="Força de contração" name="t1_fc" options={["0","1","2","3","4","5"]} value={d.fc} onChange={f("fc")}/>
        <MR label="Dor à palpação" name="t1_dpa" options={["Ausente","Presente"]} value={d.dpa} onChange={f("dpa")}
          extra={<span style={{fontSize:11,color:C.gray,display:"flex",alignItems:"center",gap:4}}>Local: <InlineInput value={d.dpl} onChange={f("dpl")} borderColor={C.tm} width={100}/></span>}/>
        <G3 style={{marginTop:8}}>
          <FInput label="Perineometria (cmH₂O)" value={d.pnm} onChange={f("pnm")}/>
          <FInput label="Endurance (seg)" value={d.end_} onChange={f("end_")}/>
          <FInput label="Obs. perineometria" value={d.pob} onChange={f("pob")}/>
        </G3>
        <ObsField value={d.obs_assoalho} onChange={f("obs_assoalho")}/>
        <DV/>
        <ST color="t">Vagina / Exame Especular e Toque</ST>
        <MR label="Trofismo vaginal" name="t1_tva" options={["Trófica","Hipotrofia","Atrofia"]} value={d.tva} onChange={f("tva")}/>
        <MR label="Conteúdo vaginal" name="t1_cv" options={["Fisiológico","Alterado"]} value={d.cv} onChange={f("cv")}/>
        <MR label="Colo" name="t1_col" options={["Sem lesões","Com lesões"]} value={d.col} onChange={f("col")}
          extra={<span style={{fontSize:11,color:C.gray,display:"flex",alignItems:"center",gap:4}}>Desc.: <InlineInput value={d.cold} onChange={f("cold")} borderColor={C.tm}/></span>}/>
        <MR label="Rotura perineal" name="t1_rp" options={["Ausente","Presente"]} value={d.rp} onChange={f("rp")}/>
        <MR label="Dor ao toque/anexos" name="t1_dt" options={["Não","Sim"]} value={d.dt} onChange={f("dt")}/>
        <MR label="Prolapso Anterior" name="t1_pan" options={["Aus.","1","2","3","4"]} value={d.pan} onChange={f("pan")}/>
        <MR label="Prolapso Apical" name="t1_pap" options={["Aus.","1","2","3","4"]} value={d.pap} onChange={f("pap")}/>
        <MR label="Prolapso Posterior" name="t1_ppo" options={["Aus.","1","2","3","4"]} value={d.ppo} onChange={f("ppo")}/>
        <MR label="IU Valsalva" name="t1_iuv" options={["Não","Sim"]} value={d.iuv} onChange={f("iuv")}/>
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:5}}>POP-Q</div>
          <div style={{display:"inline-grid",gridTemplateColumns:"repeat(3,80px)",border:`1px solid ${C.gl}`,borderRadius:5,overflow:"hidden"}}>
            {["Aa","Ba","C","gh","pb","TVL","Ap","Bp","D"].map(p=>(
              <div key={p} style={{border:`1px solid ${C.gl}`,padding:"6px 5px",textAlign:"center",background:"#fff"}}>
                <div style={{fontSize:10,fontWeight:700,color:C.teal,marginBottom:3}}>{p}</div>
                <input type="text" value={d["popq_"+p]||""} onChange={e=>set("popq_"+p,e.target.value)}
                  style={{width:"100%",border:"none",borderBottom:`1.5px solid ${C.tm}`,textAlign:"center",fontSize:13,fontFamily:"inherit",outline:"none",background:"transparent",padding:2}}/>
              </div>
            ))}
          </div>
        </div>
        <ObsField value={d.obs_vagina} onChange={f("obs_vagina")}/>
        <DV/>
        <ST color="t">Riscos Calculados</ST>
        <G2>
          <FInput label="FRAX" value={d.frax} onChange={f("frax")}/>
          <FInput label="Risco cardiovascular" value={d.rcar} onChange={f("rcar")}/>
        </G2>
        <ObsField value={d.obs_riscos} onChange={f("obs_riscos")}/>
      </SC>

      <SC color="t" title="5. Exames Complementares">
        <G2>
          <FArea label="CCO / Mamografia / Imagem" value={d.rim} onChange={f("rim")} rows={2}/>
          <FArea label="Laboratoriais / Hormonais" value={d.rla} onChange={f("rla")} rows={2}/>
          <div style={{gridColumn:"1/-1"}}><FArea label="Outros resultados relevantes" value={d.rot} onChange={f("rot")} rows={2}/></div>
        </G2>
        <DV/>
        <G2 style={{gap:"0 28px"}}>
          <div>
            <ST color="t">Rastreio Preventivo</ST>
            <Checklist items={["Colpocitologia oncótica/HPV","Mamografia","Colonoscopia","Densitometria óssea","Doppler de carótidas"]} prefix="ex_" color="t" d={d} set={set}/>
          </div>
          <div>
            <ST color="t">Solicitados Hoje</ST>
            <Checklist items={["USG transvaginal","USG mamas","USG tireoide","Painel hormonal","Laboratorial completo","Painel DST/IST"]} prefix="ex_" color="t" d={d} set={set}/>
          </div>
        </G2>
        <div style={{marginTop:10}}><FArea label="Outros exames solicitados" value={d.olab} onChange={f("olab")} rows={2}/></div>
        <DV/>
        <ST color="t">Vacinas</ST>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px"}}>
          <Checklist items={["Influenza","HPV","Shingrix (≥50a)","Pneumococo (≥60a)"]} prefix="vac_" color="t" d={d} set={set}/>
        </div>
      </SC>

      <SC color="t" title="6. Hipótese Diagnóstica e Plano">
        <FArea label="Hipóteses Diagnósticas" value={d.hip} onChange={f("hip")} rows={3}/>
        <DV/>
        <ST color="t">Medicamentos / TRH / Fitoterápicos / Fórmulas</ST>
        <MedTable rows={5} prefix="med" color="t" d={d} set={set}/>
        <DV/>
        <ST color="t">Cirurgia Proposta</ST>
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:7,fontSize:12}}>
          <thead><tr>
            {["Procedimento/Cirurgia","Orçamento (R$)","Observação"].map((h,i)=>(
              <th key={i} style={{background:C.tl,color:C.teal,fontWeight:700,padding:"7px 9px",border:`1px solid ${C.tm}`,fontSize:10,textTransform:"uppercase",letterSpacing:.3,textAlign:"left",width:i===0?"45%":"27.5%"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{[0,1,2].map(i=>(
            <tr key={i}>{["n","v","o"].map(k=>(
              <td key={k} style={{border:`1px solid ${C.gl}`,padding:"4px 8px"}}>
                <input type="text" value={d[`cir${i}_${k}`]||""} onChange={e=>set(`cir${i}_${k}`,e.target.value)}
                  style={{border:"none",background:"transparent",width:"100%",fontSize:12,fontFamily:"inherit",outline:"none"}}/>
              </td>
            ))}</tr>
          ))}</tbody>
        </table>
        <DV/>
        <ST color="t">✅ Checklist Pré-Operatório</ST>
        <G2 style={{gap:"0 28px"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Exames e Avaliações</div>
            <Checklist items={["Lab + Coag + Sorologias","EAS + urocultura","ECG","Rx tórax","Avaliação anestésica","Avaliação cardiológica"]} prefix="chk_" color="t" d={d} set={set}/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Orientações</div>
            <Checklist items={["Jejum 8h sólidos/2h líquidos","Suspensão anticoagulantes","Suspensão AAS","Tricotomia orientada","Abstinência sexual pré-op","Cuidados pós-op explicados","TCLE assinado"]} prefix="chk_" color="t" d={d} set={set}/>
          </div>
        </G2>
        <G2 style={{marginTop:9}}>
          <FInput label="Data prevista da cirurgia" value={d.dcir} onChange={f("dcir")}/>
          <FInput label="Obs. / pendências pré-op" value={d.pobs} onChange={f("pobs")}/>
        </G2>
        <DV/>
        <FArea label="Conduta / Orientações" value={d.conduta} onChange={f("conduta")} rows={5}/>
      </SC>
      <RetornoBar value={d.retorno} onChange={f("retorno")}/>
      <Sig/>
    </div>
  );
}

// ── TAB 2 ─────────────────────────────────────────────────────────────────────
function Tab2({d,set}){
  const f=k=>v=>set(k,v);
  const chk=k=>v=>set(k,v);
  return(
    <div style={{padding:"0 28px 28px"}}>
      <SC color="a" title="1. Subjetivo — Queixa e Evolução">
        <G2>
          <div style={{gridColumn:"1/-1"}}><FArea label="Queixa / evolução desde a última consulta" value={d.b_queixa} onChange={f("b_queixa")} rows={3} color="a"/></div>
          <FInput label="Tolerância ao tratamento" value={d.b_tol} onChange={f("b_tol")} color="a"/>
          <FInput label="Adesão ao tratamento" value={d.b_ade} onChange={f("b_ade")} color="a"/>
        </G2>
        <DV/>
        <ST color="a">Mudanças desde a Última Consulta</ST>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px"}}>
          <Checklist items={["Novo medicamento","Cirurgia/procedimento","Comorbidade nova","Mudança de hábitos"]} prefix="b_mud_" color="a" d={d} set={set}/>
        </div>
        <div style={{marginTop:8}}><FArea label="Detalhes" value={d.b_mdet} onChange={f("b_mdet")} rows={2} color="a"/></div>
      </SC>

      <SC color="a" title="2. Objetivo — Exame Físico">
        <ST color="a">Biometria Comparativa</ST>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginTop:7}}>
          <thead><tr>
            <th style={{background:C.al,color:C.amber,fontWeight:700,padding:"6px 9px",border:`1px solid ${C.ab}`,fontSize:10,textAlign:"left",width:130}}>Parâmetro</th>
            {["Anterior","Hoje","Variação"].map(h=>(
              <th key={h} style={{background:C.al,color:C.amber,fontWeight:700,padding:"6px 9px",border:`1px solid ${C.ab}`,fontSize:10,textAlign:"center"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{["Peso (kg)","IMC","% Gordura","% Massa magra","Gordura visceral","PA"].map(p=>(
            <tr key={p}>
              <td style={{border:`1px solid ${C.gl}`,padding:"4px 8px",fontWeight:700,color:C.gray,fontSize:11,background:C.al}}>{p}</td>
              {["a","h","v"].map(k=>(
                <td key={k} style={{border:`1px solid ${C.gl}`,padding:"4px 8px",textAlign:"center"}}>
                  <input type="text" value={d[`b_bio_${p}_${k}`]||""} onChange={e=>set(`b_bio_${p}_${k}`,e.target.value)}
                    style={{border:"none",background:"transparent",width:"100%",fontSize:12,fontFamily:"inherit",outline:"none",textAlign:"center"}}/>
                </td>
              ))}
            </tr>
          ))}</tbody>
        </table>
        <ObsField value={d.b_obs_biometria} onChange={f("b_obs_biometria")} color="a"/>
        <DV/>
        <ST color="a">Exame Físico Geral</ST>
        <MR label="Trofismo vaginal" name="t2_tv" options={["Trófica","Hipotrofia","Atrofia"]} value={d.b_tv} onChange={f("b_tv")}/>
        <MR label="Trofismo vulvar" name="t2_tvu" options={["Normotrófico","Hipotrofia","Atrofia"]} value={d.b_tvu} onChange={f("b_tvu")}/>
        <MR label="Continência (Valsalva)" name="t2_co" options={["Continente","Incontinente"]} value={d.b_co} onChange={f("b_co")}/>
        <MR label="Prolapso Anterior" name="t2_pan" options={["Aus.","1","2","3","4"]} value={d.b_pan} onChange={f("b_pan")}/>
        <MR label="Prolapso Apical" name="t2_pap" options={["Aus.","1","2","3","4"]} value={d.b_pap} onChange={f("b_pap")}/>
        <MR label="Prolapso Posterior" name="t2_ppo" options={["Aus.","1","2","3","4"]} value={d.b_ppo} onChange={f("b_ppo")}/>
        <ObsField value={d.b_obs_geral} onChange={f("b_obs_geral")} color="a"/>
        <DV/>
        <ST color="a">Exame Pós-Operatório</ST>
        <G2 style={{marginBottom:9}}>
          <FInput label="Procedimento realizado" value={d.b_ppr} onChange={f("b_ppr")} color="a"/>
          <FInput label="Data da cirurgia / DPO" value={d.b_dpo} onChange={f("b_dpo")} color="a"/>
        </G2>
        <MR label="Cicatrização" name="t2_cic" options={["Adequada","Parcial","Inadequada"]} value={d.b_cic} onChange={f("b_cic")}/>
        <MR label="Deiscência" name="t2_dei" options={["Ausente","Presente"]} value={d.b_dei} onChange={f("b_dei")}
          extra={<span style={{fontSize:11,color:C.gray,display:"flex",alignItems:"center",gap:4}}>Local: <InlineInput value={d.b_deil} onChange={f("b_deil")} borderColor={C.ab} width={100}/></span>}/>
        <MR label="Sinais flogísticos" name="t2_flo" options={["Ausentes","Presentes"]} value={d.b_flo} onChange={f("b_flo")}/>
        <MR label="Edema local" name="t2_ede" options={["Ausente","Leve","Moderado","Importante"]} value={d.b_ede} onChange={f("b_ede")}/>
        <MR label="Hematoma" name="t2_hem" options={["Ausente","Presente"]} value={d.b_hem} onChange={f("b_hem")}/>
        <MR label="Secreção" name="t2_sec" options={["Ausente","Fisiológica","Purulenta"]} value={d.b_sec} onChange={f("b_sec")}/>
        <MR label="Dor local" name="t2_dor" options={["Ausente","Leve","Moderada","Intensa"]} value={d.b_dor} onChange={f("b_dor")}/>
        <MR label="Resultado estético" name="t2_res" options={["Excelente","Bom","Regular","Insatisfatório"]} value={d.b_res} onChange={f("b_res")}/>
        <ObsField value={d.b_obs_posop} onChange={f("b_obs_posop")} color="a"/>
        <div style={{marginTop:14,background:C.al,border:`1.5px solid ${C.ab}`,borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontWeight:700,fontSize:12,color:C.amber,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>📷 Registro Fotográfico Pós-Operatório</div>
          <G3 style={{marginBottom:9}}>
            <FInput label="DPO do registro" value={d.b_fdpo} onChange={f("b_fdpo")} color="a"/>
            <FInput label="Comparativo com" value={d.b_fcomp} onChange={f("b_fcomp")} color="a"/>
            <FInput label="Sistema" value={d.b_fsist} onChange={f("b_fsist")} color="a"/>
          </G3>
          <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px"}}>
            <Checklist items={["Foto pré-op disponível","Foto pós-op realizada hoje","Imagens arquivadas","Autorização assinada"]} prefix="b_foto_" color="a" d={d} set={set}/>
          </div>
          <ObsField value={d.b_obs_foto} onChange={f("b_obs_foto")} color="a"/>
        </div>
      </SC>

      <SC color="a" title="3. Resultados de Exames">
        <G2>
          <FArea label="CCO / Mamografia / Imagem" value={d.b_ri} onChange={f("b_ri")} rows={2} color="a"/>
          <FArea label="Laboratoriais / Hormonais" value={d.b_rl} onChange={f("b_rl")} rows={2} color="a"/>
          <div style={{gridColumn:"1/-1"}}><FArea label="Outros" value={d.b_ro} onChange={f("b_ro")} rows={2} color="a"/></div>
        </G2>
      </SC>

      <SC color="a" title="4. Avaliação e Plano">
        <FArea label="Hipótese diagnóstica / diagnóstico atual" value={d.b_hip} onChange={f("b_hip")} rows={2} color="a"/>
        <DV/>
        <ST color="a">Medicamentos / TRH / Ajustes</ST>
        <MedTable rows={4} prefix="b_med" color="a" d={d} set={set}/>
        <DV/>
        <FArea label="Conduta / Orientações" value={d.b_conduta} onChange={f("b_conduta")} rows={5} color="a"/>
      </SC>
      <RetornoBar color="a" value={d.b_retorno} onChange={f("b_retorno")}/>
      <Sig/>
    </div>
  );
}

// ── TAB 3 ─────────────────────────────────────────────────────────────────────
function Tab3({d,set}){
  const f=k=>v=>set(k,v);
  const chk=k=>v=>set(k,v);
  return(
    <div style={{padding:"0 28px 28px"}}>
      <SC color="v" title="A. Resumo Clínico">
        <G2>
          <FArea label="Comorbidades relevantes" value={d.c_comor} onChange={f("c_comor")} rows={2} color="v"/>
          <FArea label="Medicamentos em uso" value={d.c_meds} onChange={f("c_meds")} rows={2} color="v"/>
          <div style={{gridColumn:"1/-1"}}><FArea label="História cirúrgica prévia" value={d.c_cirp} onChange={f("c_cirp")} rows={2} color="v"/></div>
        </G2>
      </SC>

      <SC color="v" title="B. Queixa e Motivação">
        <FArea label="Queixa principal / Motivação para a cirurgia" value={d.c_qp} onChange={f("c_qp")} rows={3} color="v"/>
        <DV/>
        <ST color="v">Expectativas da Paciente</ST>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px",marginBottom:8}}>
          <Checklist items={["Melhora funcional","Melhora estética","Autoestima","Vida sexual","Prática esportiva","Higiene e conforto"]} prefix="c_exp_" color="v" d={d} set={set}/>
        </div>
        <FInput label="Outras expectativas" value={d.c_expout} onChange={f("c_expout")} color="v"/>
      </SC>

      <SC color="v" title="C. Exame Físico Cirúrgico">
        <ST color="v">Biometria</ST>
        <G3>
          <FInput label="PA" value={d.c_pa} onChange={f("c_pa")} color="v"/>
          <FInput label="Peso (kg)" value={d.c_pes} onChange={f("c_pes")} color="v"/>
          <FInput label="IMC" value={d.c_imc} onChange={f("c_imc")} color="v"/>
        </G3>
        <ObsField value={d.c_obs_biometria} onChange={f("c_obs_biometria")} color="v"/>
        <DV/>
        <ST color="v">Avaliação Vulvoperineal</ST>
        <MR label="Trofismo vulvar" name="t3_tv" options={["Normotrófico","Hipotrofia","Atrofia"]} value={d.c_tv} onChange={f("c_tv")}/>
        <MR label="Assimetria labial" name="t3_al" options={["Ausente","Leve","Moderada","Importante"]} value={d.c_al} onChange={f("c_al")}/>
        <MR label="Hipertrofia lábios menores" name="t3_hm" options={["Ausente","Grau I","Grau II","Grau III","Grau IV"]} value={d.c_hm} onChange={f("c_hm")}/>
        <MR label="Exposição do clitóris" name="t3_ec" options={["Não","Sim"]} value={d.c_ec} onChange={f("c_ec")}/>
        <MR label="Flacidez vulvar" name="t3_fv" options={["Ausente","Leve","Moderada","Importante"]} value={d.c_fv} onChange={f("c_fv")}/>
        <MR label="Prolapso perineal" name="t3_pp" options={["Ausente","Presente"]} value={d.c_pp} onChange={f("c_pp")}/>
        <MR label="IU Valsalva" name="t3_iuv" options={["Não","Sim"]} value={d.c_iuv} onChange={f("c_iuv")}/>
        <MR label="Ref. bulbocavernoso" name="t3_rb" options={["Presente","Ausente"]} value={d.c_rb} onChange={f("c_rb")}/>
        <MR label="Ref. anocutâneo" name="t3_ra" options={["Presente","Ausente"]} value={d.c_ra} onChange={f("c_ra")}/>
        <ObsField value={d.c_obs_vulva} onChange={f("c_obs_vulva")} color="v"/>
        <DV/>
        <ST color="v">POP-Q</ST>
        <div style={{display:"inline-grid",gridTemplateColumns:"repeat(3,80px)",border:`1px solid ${C.gl}`,borderRadius:5,overflow:"hidden"}}>
          {["Aa","Ba","C","gh","pb","TVL","Ap","Bp","D"].map(p=>(
            <div key={p} style={{border:`1px solid ${C.gl}`,padding:"6px 5px",textAlign:"center",background:"#fff"}}>
              <div style={{fontSize:10,fontWeight:700,color:C.violet,marginBottom:3}}>{p}</div>
              <input type="text" value={d["c_popq_"+p]||""} onChange={e=>set("c_popq_"+p,e.target.value)}
                style={{width:"100%",border:"none",borderBottom:`1.5px solid ${C.vm}`,textAlign:"center",fontSize:13,fontFamily:"inherit",outline:"none",background:"transparent",padding:2}}/>
            </div>
          ))}
        </div>
        <ObsField value={d.c_obs_popq} onChange={f("c_obs_popq")} color="v"/>
        <DV/>
        <div style={{marginTop:8}}><Check label="📷 Fotodocumentação realizada" checked={d.c_foto} onChange={chk("c_foto")} color="v"/></div>
        <ObsField value={d.c_obs_foto} onChange={f("c_obs_foto")} color="v"/>
      </SC>

      <SC color="v" title="D. Indicação Cirúrgica e Plano">
        <FArea label="Diagnóstico / Indicação" value={d.c_ind} onChange={f("c_ind")} rows={3} color="v"/>
        <DV/>
        <ST color="v">Procedimentos Propostos</ST>
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:7,fontSize:12}}>
          <thead><tr>
            {["Procedimento/Cirurgia","Técnica","Orçamento (R$)","Observação"].map((h,i)=>(
              <th key={i} style={{background:C.vl,color:C.violet,fontWeight:700,padding:"7px 9px",border:`1px solid ${C.vm}`,fontSize:10,textTransform:"uppercase",letterSpacing:.3,textAlign:"left",width:i===0?"35%":i===1?"20%":i===2?"20%":"25%"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{[0,1,2,3].map(i=>(
            <tr key={i}>{["n","t","v","o"].map(k=>(
              <td key={k} style={{border:`1px solid ${C.gl}`,padding:"4px 8px"}}>
                <input type="text" value={d[`c_proc${i}_${k}`]||""} onChange={e=>set(`c_proc${i}_${k}`,e.target.value)}
                  style={{border:"none",background:"transparent",width:"100%",fontSize:12,fontFamily:"inherit",outline:"none"}}/>
              </td>
            ))}</tr>
          ))}</tbody>
        </table>
        <DV/>
        <FArea label="Riscos e Contraindicações" value={d.c_ris} onChange={f("c_ris")} rows={3} color="v"/>
        <DV/>
        <ST color="v">✅ Checklist Pré-Operatório</ST>
        <G2 style={{gap:"0 28px"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.violet,textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Exames e Avaliações</div>
            <Checklist items={["Lab + Coag + Sorologias","EAS + urocultura","ECG","Rx tórax","Avaliação anestésica","Avaliação cardiológica"]} prefix="c_chk_" color="v" d={d} set={set}/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.violet,textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Orientações e Documentos</div>
            <Checklist items={["Jejum 8h sólidos/2h líquidos","Suspensão anticoagulantes","Suspensão AAS","Tricotomia orientada","Abstinência sexual pré-op","Cuidados pós-op explicados","TCLE assinado","Autorização uso de imagem"]} prefix="c_chk_" color="v" d={d} set={set}/>
          </div>
        </G2>
        <G2 style={{marginTop:9}}>
          <FInput label="Data prevista da cirurgia" value={d.c_dcir} onChange={f("c_dcir")} color="v"/>
          <FInput label="Obs. / pendências pré-op" value={d.c_pobs} onChange={f("c_pobs")} color="v"/>
        </G2>
        <DV/>
        <FArea label="Conduta / Orientações Pré-Cirúrgicas" value={d.c_conduta} onChange={f("c_conduta")} rows={5} color="v"/>
      </SC>
      <RetornoBar color="v" value={d.c_retorno} onChange={f("c_retorno")}/>
      <Sig/>
    </div>
  );
}

// ── QUICK PROMPTS ─────────────────────────────────────────────────────────────
const QUICK=[
  {icon:"🔍",label:"Hipóteses diagnósticas"},
  {icon:"💊",label:"Sugestões de TRH"},
  {icon:"⚠️",label:"Interações medicamentosas"},
  {icon:"🔬",label:"Exames indicados"},
  {icon:"📋",label:"Resumo do prontuário"},
  {icon:"🩺",label:"Orientações cirúrgicas"},
];

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function App(){
  const [patients,setPatients]=useState([]);
  const [patient,setPatient]=useState(null);
  const [consultas,setConsultas]=useState([]);
  const [consultaId,setConsId]=useState(null);
  const [tab,setTab]=useState(0);
  const [showModal,setShowModal]=useState(false);
  const [saveMsg,setSaveMsg]=useState("💾 Salvamento automático ativo");
  const [messages,setMessages]=useState([
    {role:"ai",text:"Olá! Sou a assistente clínica da Dra. Maria Barreto. Selecione uma paciente para começar. Tenho acesso a todos os dados do prontuário preenchido."}
  ]);
  const [aiInput,setAiInput]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const chatRef=useRef(null);
  const saveTimer=useRef(null);

  useEffect(()=>{ loadPatients(); },[]);
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; },[messages]);

  async function loadPatients(){
    const {data}=await supabase.from("pacientes").select("id,nome,cpf,data_nascimento").order("nome");
    if(data){
      // buscar total de consultas por paciente
      const withCount = await Promise.all(data.map(async p=>{
        const {count}=await supabase.from("consultas").select("id",{count:"exact",head:true}).eq("paciente_id",p.id);
        return {...p,total_consultas:count||0};
      }));
      setPatients(withCount);
    }
  }

  async function loadConsultas(patientId){
    const {data}=await supabase.from("consultas").select("id,data_consulta,tipo").eq("paciente_id",patientId).order("created_at",{ascending:false});
    setConsultas(data||[]);
    if(data&&data.length>0) setConsId(data[0].id);
    else await novaConsulta(patientId,false);
  }

  const consultaData = consultas.find(c=>c.id===consultaId) || {};

  async function selectPatient(p){
    setShowModal(false);
    if(!p){
      // nova paciente
      const {data,error}=await supabase.from("pacientes").insert({nome:"",cpf:"",data_nascimento:""}).select().single();
      if(data){
        setPatient(data);
        await loadConsultas(data.id);
        loadPatients();
      }
    } else {
      setPatient(p);
      await loadConsultas(p.id);
    }
  }

  async function deletePatient(id){
    await supabase.from("pacientes").delete().eq("id",id);
    setPatients(prev=>prev.filter(p=>p.id!==id));
    if(patient?.id===id){
      setPatient(null);
      setConsultas([]);
      setConsId(null);
    }
  }

  async function novaConsulta(patientId,reload=true){
    const pid=patientId||patient?.id;
    if(!pid) return;
    const {data}=await supabase.from("consultas").insert({
      paciente_id:pid,
      data_consulta:today(),
      tipo:"primeira_consulta",
      dados:{}
    }).select().single();
    if(data){
      if(reload){
        setConsultas(prev=>[data,...prev]);
        setConsId(data.id);
      } else {
        setConsultas([data]);
        setConsId(data.id);
      }
    }
  }

  async function updatePatientMeta(key,val){
    if(!patient) return;
    const updated={...patient,[key]:val};
    setPatient(updated);
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      await supabase.from("pacientes").update({[key]:val}).eq("id",patient.id);
      setSaveMsg("✅ Salvo — "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}));
    },800);
  }

  const setField=useCallback((key,val)=>{
    if(!consultaId) return;
    setConsultas(prev=>prev.map(c=>{
      if(c.id!==consultaId) return c;
      const updated={...c,dados:{...(c.dados||{}),[key]:val}};
      clearTimeout(saveTimer.current);
      saveTimer.current=setTimeout(async()=>{
        await supabase.from("consultas").update({dados:updated.dados}).eq("id",consultaId);
        setSaveMsg("✅ Salvo — "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}));
      },800);
      return updated;
    }));
  },[consultaId]);

  function collectContext(){
    if(!patient) return "Nenhuma paciente selecionada.";
    const d=consultaData.dados||{};
    const lines=[
      `=== PRONTUÁRIO GINECOLÓGICO — Dra. Maria Barreto ===`,
      `Paciente: ${patient.nome||"(sem nome)"} | DN: ${patient.data_nascimento||"-"} | CPF: ${patient.cpf||"-"}`,
      `Consulta: ${consultaData.data_consulta||today()}`,
    ];
    Object.entries(d).forEach(([k,v])=>{
      if(v&&typeof v==="string"&&v.trim()) lines.push(`${k}: ${v}`);
      if(v===true) lines.push(`✓ ${k}`);
    });
    return lines.join("\n");
  }

  async function sendAI(text){
    const msg=text||aiInput.trim();
    if(!msg||aiLoading) return;
    setAiInput("");
    setMessages(prev=>[...prev,{role:"user",text:msg}]);
    setAiLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`Você é a assistente clínica especializada em ginecologia, uroginecologia e cirurgia íntima da Dra. Maria Barreto (CRM-DF 34683 · CRM-SP 231293). Auxilia exclusivamente profissionais de saúde. Seja objetiva, clínica e precisa. Use terminologia médica. Cite FEBRASGO, ACOG quando relevante. Nunca substitua julgamento clínico.`,
          messages:[{role:"user",content:`${collectContext()}\n\n---\nPergunta da médica: ${msg}`}]
        })
      });
      const data=await res.json();
      setMessages(prev=>[...prev,{role:"ai",text:data.content?.[0]?.text||"Sem resposta."}]);
    }catch{
      setMessages(prev=>[...prev,{role:"ai",text:"Erro ao conectar com o assistente."}]);
    }
    setAiLoading(false);
  }

  const TABS=[
    {label:"📋 1ª Consulta",bg:C.teal,title:"Consulta Ginecológica — Primeira Consulta"},
    {label:"🔄 Retorno",bg:C.amber,title:"Consulta Ginecológica — Retorno"},
    {label:"🩺 Av. Cirúrgica",bg:C.violet,title:"Avaliação Cirúrgica — Estética e Funcional"},
  ];
  const patBg=[C.tl,C.al,C.vl][tab];
  const patBdr=[C.tm,C.ab,C.vb][tab];
  const tabColor=["t","a","v"][tab];
  const d=consultaData.dados||{};

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 370px",minHeight:"100vh",fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:13,color:C.dark,background:"#e8ecef"}}>

      {/* MAIN */}
      <div style={{overflowY:"auto",padding:16}}>

        {/* TOP BAR */}
        <div style={{background:C.w,border:`2px solid ${C.olive}`,borderRadius:10,padding:"0 20px",display:"flex",alignItems:"center",gap:14,height:64,boxShadow:"0 2px 8px rgba(0,0,0,.06)",marginBottom:14}}>
          <img src={`${LOGO}`} alt="mb." style={{height:38,width:"auto"}}/>
          <div style={{flex:1,paddingLeft:16,borderLeft:`1px solid ${C.gl}`}}>
            <div style={{fontSize:15,fontWeight:700,color:C.dark}}>Dra. Maria Barreto</div>
            <div style={{fontSize:10,color:"#888",letterSpacing:.5,textTransform:"uppercase"}}>Ginecologia · Uroginecologia · Cirurgia Íntima · CRM-DF 34683 · CRM-SP 231293</div>
          </div>
          <span style={{fontSize:11,color:"#555",background:C.oliveL,border:`1px solid ${C.oliveM}`,borderRadius:20,padding:"4px 12px",flexShrink:0}}>{saveMsg}</span>
          {patient&&<button onClick={()=>novaConsulta()} style={{background:"#fff",color:C.teal,border:`1.5px solid ${C.teal}`,borderRadius:7,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>+ Nova Consulta</button>}
          <button onClick={()=>setShowModal(true)} style={{background:C.olive,color:"#fff",border:"none",borderRadius:7,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>👤 Pacientes</button>
          <button onClick={()=>window.print()} style={{background:C.olive2,color:"#fff",border:"none",borderRadius:7,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>🖨️ PDF</button>
        </div>

        {/* BANNER PACIENTE */}
        {patient?(
          <div style={{background:C.w,borderRadius:10,padding:"12px 20px",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:12}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:"uppercase",letterSpacing:.3,marginBottom:3}}>Paciente</div>
                <input type="text" value={patient.nome||""} onChange={e=>updatePatientMeta("nome",e.target.value)} placeholder="Nome completo"
                  style={{border:"none",borderBottom:`1.5px solid ${C.tm}`,background:"transparent",fontSize:14,fontWeight:600,color:C.dark,padding:"2px",outline:"none",fontFamily:"inherit",width:"100%"}}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:"uppercase",letterSpacing:.3,marginBottom:3}}>Data de Nasc.</div>
                <input type="text" value={patient.data_nascimento||""} onChange={e=>updatePatientMeta("data_nascimento",e.target.value)} placeholder="DD/MM/AAAA"
                  style={{border:"none",borderBottom:`1.5px solid ${C.tm}`,background:"transparent",fontSize:13,color:C.dark,padding:"2px",outline:"none",fontFamily:"inherit",width:"100%"}}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:"uppercase",letterSpacing:.3,marginBottom:3}}>CPF</div>
                <input type="text" value={patient.cpf||""} onChange={e=>updatePatientMeta("cpf",e.target.value)}
                  style={{border:"none",borderBottom:`1.5px solid ${C.tm}`,background:"transparent",fontSize:13,color:C.dark,padding:"2px",outline:"none",fontFamily:"inherit",width:"100%"}}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:"uppercase",letterSpacing:.3,marginBottom:3}}>Consulta</div>
                <select value={consultaId||""} onChange={e=>setConsId(e.target.value)}
                  style={{border:"none",borderBottom:`1.5px solid ${C.tm}`,background:"transparent",fontSize:13,color:C.dark,padding:"2px",outline:"none",fontFamily:"inherit",width:"100%",cursor:"pointer"}}>
                  {consultas.map(c=>(
                    <option key={c.id} value={c.id}>{c.data_consulta||c.id}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ):(
          <div style={{background:C.w,borderRadius:10,padding:32,marginBottom:12,textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
            <div style={{fontSize:32,marginBottom:12}}>👤</div>
            <div style={{fontWeight:700,fontSize:16,color:C.dark,marginBottom:8}}>Nenhuma paciente selecionada</div>
            <div style={{color:C.gray,fontSize:13,marginBottom:20}}>Selecione uma paciente existente ou crie um novo prontuário</div>
            <button onClick={()=>setShowModal(true)} style={{background:C.olive,color:"#fff",border:"none",borderRadius:8,padding:"10px 24px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Selecionar / Nova Paciente</button>
          </div>
        )}

        {patient&&(
          <>
            <div style={{display:"flex",gap:6,marginBottom:0}}>
              {TABS.map((t,i)=>(
                <button key={i} onClick={()=>setTab(i)} style={{padding:"9px 22px",borderRadius:"8px 8px 0 0",border:`1.5px solid ${i===tab?t.bg:C.gl}`,borderBottom:"none",background:i===tab?t.bg:"#d8e3e6",color:i===tab?"#fff":C.gray,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{t.label}</button>
              ))}
            </div>
            <div style={{background:C.w,borderRadius:"0 10px 10px 10px",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.08)"}}>
              <div style={{padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",background:TABS[tab].bg}}>
                <div>
                  <div style={{color:"#fff",fontSize:13,fontWeight:700,letterSpacing:.3,textTransform:"uppercase"}}>{TABS[tab].title}</div>
                  <div style={{color:"rgba(255,255,255,.72)",fontSize:10,marginTop:2}}>Uroginecologia · Cirurgia Íntima · Reposição Hormonal</div>
                </div>
                <img src={`${LOGO}`} alt="mb." style={{height:40,background:"#fff",borderRadius:4,padding:"4px 8px"}}/>
              </div>
              <div style={{background:patBg,borderBottom:`2px solid ${patBdr}`,padding:"10px 28px",display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
                <div style={{fontSize:13,fontWeight:700,color:C.dark,alignSelf:"center"}}>{patient.nome||"(sem nome)"}</div>
                <FInput label="Data da consulta" value={d.dataConsulta||consultaData.data_consulta} onChange={v=>setField("dataConsulta",v)} color={tabColor}/>
                <FInput label="Convênio / Particular" value={d.conv} onChange={v=>setField("conv",v)} color={tabColor}/>
              </div>
              {tab===0&&<Tab1 d={d} set={setField}/>}
              {tab===1&&<Tab2 d={d} set={setField}/>}
              {tab===2&&<Tab3 d={d} set={setField}/>}
            </div>
          </>
        )}
      </div>

      {/* AI SIDEBAR */}
      <div style={{background:C.aiBg,display:"flex",flexDirection:"column",borderLeft:`1px solid ${C.aiBdr}`,position:"sticky",top:0,height:"100vh",overflow:"hidden"}}>
        <div style={{padding:"18px 18px 12px",borderBottom:`1px solid ${C.aiBdr}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.aiAcc,boxShadow:`0 0 8px ${C.aiAcc}`}}/>
            <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:600,color:"#f1f5f9"}}>Assistente Clínica</div>
          </div>
          <div style={{fontSize:10,color:"#64748b",letterSpacing:.4,textTransform:"uppercase"}}>IA integrada · Dra. Maria Barreto</div>
        </div>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.aiBdr}`}}>
          <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,color:"#64748b",marginBottom:8}}>Ações rápidas</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {QUICK.map(q=>(
              <button key={q.label} onClick={()=>sendAI(q.label)}
                style={{background:C.aiBdr,color:"#94a3b8",border:"1px solid #334155",borderRadius:8,padding:"8px 10px",fontSize:11,cursor:"pointer",textAlign:"left",fontFamily:"inherit",lineHeight:1.3,transition:"all .15s"}}
                onMouseOver={e=>{e.currentTarget.style.background="#334155";e.currentTarget.style.borderColor=C.aiAcc;e.currentTarget.style.color="#e2e8f0"}}
                onMouseOut={e=>{e.currentTarget.style.background=C.aiBdr;e.currentTarget.style.borderColor="#334155";e.currentTarget.style.color="#94a3b8"}}>
                <span style={{display:"block",fontSize:14,marginBottom:3}}>{q.icon}</span>{q.label}
              </button>
            ))}
          </div>
        </div>
        <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"12px 18px",display:"flex",flexDirection:"column",gap:10}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:3}}>
              <div style={{padding:"9px 13px",fontSize:12,lineHeight:1.55,maxWidth:"94%",whiteSpace:"pre-wrap",background:m.role==="user"?C.aiAcc:"#1e293b",color:m.role==="user"?"#fff":"#cbd5e1",borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",border:m.role==="ai"?`1px solid ${C.aiBdr}`:"none"}}>{m.text}</div>
            </div>
          ))}
          {aiLoading&&(
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"9px 13px",background:"#1e293b",borderRadius:"12px 12px 12px 3px",border:`1px solid ${C.aiBdr}`,width:"fit-content"}}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#64748b",animation:`bounce .8s ${i*.15}s infinite`}}/>)}
            </div>
          )}
        </div>
        <div style={{padding:"12px 18px",borderTop:`1px solid ${C.aiBdr}`}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAI();}}}
              placeholder="Pergunte sobre este prontuário... (Enter)"
              style={{flex:1,background:"#1e293b",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",fontFamily:"inherit",fontSize:12,padding:"9px 12px",outline:"none",resize:"none",minHeight:38,maxHeight:100}}
              onFocus={e=>e.target.style.borderColor=C.aiAcc}
              onBlur={e=>e.target.style.borderColor="#334155"}/>
            <button onClick={()=>sendAI()} disabled={aiLoading||!aiInput.trim()}
              style={{background:aiLoading||!aiInput.trim()?"#334155":C.aiAcc,border:"none",color:"#fff",borderRadius:8,width:36,height:36,fontSize:18,cursor:aiLoading||!aiInput.trim()?"not-allowed":"pointer",flexShrink:0}}>↑</button>
          </div>
          <div style={{fontSize:9,color:"#475569",textAlign:"center",marginTop:6}}>A IA lê os campos preenchidos · Não substitui julgamento clínico</div>
        </div>
      </div>

      {showModal&&<PatientModal patients={patients} onSelect={selectPatient} onClose={()=>setShowModal(false)} onDelete={deletePatient}/>}

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px;}
        @media print{
          div[style*="370px"]{display:none!important;}
          body{background:#fff;}
          @page{margin:1.4cm;size:A4;}
        }
      `}</style>
    </div>
  );
}

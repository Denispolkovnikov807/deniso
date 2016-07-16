//Ivanius51 13.07.2016 АвтоЛастхит крипов

//интервал(в секундах) через который будет делаться проверка
var interval = 0.1
//debugg
var debug = true

var z = []
var Range = 0
var i = 0
var CurCreep = 0

//DmgMultimler
var buffsMulDmg = 
[
	["modifier_item_quelling_blade", 1.4],
	["modifier_item_bfury", 1.6],
	["modifier_item_iron_talon", 1.4],
	["modifier_bloodseeker_bloodrage", [1.25,1.3,1.35,1.4]],
]

//список указателей на мобов - крипов
Game.CreepsList = function(){
	var CreepsEnt =  Entities.GetAllEntitiesByClassname('npc_dota_creep_lane')
	CreepsEnt.concat(Entities.GetAllEntitiesByClassname('npc_dota_creep_neutral'))
	return CreepsEnt
}

var exprangeLoad = function(){
	try{
		Particles.DestroyParticleEffect(Game.Particles.ExpRange,Game.Particles.ExpRange)
	}
	catch(e){}
	var MyEnt = Players.GetPlayerHeroEntityIndex( Game.GetLocalPlayerID() )
	Game.Particles.ExpRange = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
	Particles.SetParticleControl(Game.Particles.ExpRange, 1, [Range,0,0])
}

function AutoLastHitF(){
	//проверяем включен ли скрипт в панели
	if ( !AutoLastHit.checked )
		return
	//получаем свой указатель
	i += 1;

	var User = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if (i == 100) {
		Range = Entities.GetAttackRange(User)
		exprangeLoad()
		i = 0
	}
	var UserBuffs = Game.GetBuffsNames(User)
	var UserDmg = 1
	/*if (Entities.IsRangedAttacker(User))
		UserDmg = Entities.GetDamageMin(User)
	else
		UserDmg = Entities.GetDamageMax(User)*/
	
	UserDmg = (Entities.GetDamageMax(User)-Entities.GetDamageMin(User))/2
	UserDmg += Entities.GetDamageMin(User)
	UserDmg += Entities.GetDamageBonus(User)
	
	var MulDmg = 1

	for (ibuff in UserBuffs)
		for (mulbuff in buffsMulDmg)			
		if(UserBuffs[ibuff] == buffsMulDmg[mulbuff][0])
		{
			//if(debug) $.Msg( 'My buffs: ' + UserBuffs[ibuff])
			if(Array.isArray(buffsMulDmg[mulbuff][1]))
				MulDmg *= buffsMulDmg[mulbuff][1][Abilities.GetLevel(Buffs.GetAbility(ent,buffs[i]))-1]
			else
				MulDmg *= buffsMulDmg[mulbuff][1]
		}	
	
	//if(debug) $.Msg( 'My dmg: ' + UserDmg + MulDmg + (MulDmg*UserDmg))
	
	var Creeps = Entities.GetAllEntitiesByClassname('npc_dota_creep_lane')
	Creeps.concat(Entities.GetAllEntitiesByClassname('npc_dota_creep_neutral'))

	
	if (Entities.IsAlive(User))
	for (icreep in Creeps) 
	{
		var CreepArmor =(Entities.GetBonusPhysicalArmor(Creeps[icreep])+Entities.GetPhysicalArmorValue(Creeps[icreep]))
		if (CreepArmor>=0)
			CreepArmor = 1+((0.06 * CreepArmor) / (1 + 0.06 * CreepArmor))
		else
			CreepArmor = 0.94
		
		if ((Entities.IsAlive(Creeps[icreep]))&&(Entities.IsEntityInRange(Creeps[icreep],User,800))&&
				((((UserDmg*MulDmg)>=(Entities.GetHealth(Creeps[icreep])*CreepArmor))&&(Entities.IsEnemy(Creeps[icreep])))||(UserDmg>=(Entities.GetHealth(Creeps[icreep])*CreepArmor))))
		{
			if ((Entities.IsEnemy(Creeps[icreep]))&&((Entities.IsEntityInRange(Creeps[icreep],User,Entities.GetAttackRange(User)))||(Entities.IsEntityInRange(Creeps[icreep],User,250))))
			{
				Game.AttackTarget(User,Creeps[icreep],0)	
				CurCreep = Creeps[icreep]
				break
			}
		}
	}		
}

function CreateFollowParticle(time,particlepath,someobj,ent){
	if(z.indexOf(ent)!=-1)
		return
	var p = Particles.CreateParticle(particlepath, ParticleAttachment_t.PATTACH_OVERHEAD_FOLLOW, someobj)
	Particles.SetParticleControl(p, 0,  0)
	z.push(ent)
	$.Schedule(time+0.1,function(){ Particles.DestroyParticleEffect(p,p); z.splice(z.indexOf(ent),1); })
}

var AutoLastHitOnCheckBoxClick = function(){
	if ( !AutoLastHit.checked ){
		Game.ScriptLogMsg('Script disabled: AutoLastHit (forked Ivanius51)', '#ff0000')
		return
	}
	//циклически замкнутый таймер с проверкой условия с интервалом 'interval'

	function maincheck(){ $.Schedule( interval,function(){
		AutoLastHitF()
		if(AutoLastHit.checked)
			maincheck()
	})}
	maincheck()
	Game.ScriptLogMsg('Script enabled: AutoLastHit (forked Ivanius51)', '#00ff00')
}

//шаблонное добавление чекбокса в панель
var Temp = $.CreatePanel( "Panel", $('#scripts'), "AutoLastHit" )
Temp.SetPanelEvent( 'onactivate', AutoLastHitOnCheckBoxClick )
Temp.BLoadLayoutFromString( '<root><styles><include src="s2r://panorama/styles/dotastyles.vcss_c" /><include src="s2r://panorama/styles/magadan.vcss_c" /></styles><Panel><ToggleButton class="CheckBox" id="AutoLastHit" text="AutoLastHit"/></Panel></root>', false, false)  
var AutoLastHit = $.GetContextPanel().FindChildTraverse( 'AutoLastHit' ).Children()[0]
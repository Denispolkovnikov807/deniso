//На основе скрипта ZeusAutoult by D2JS(https://vk.com/exieros)
//Автоматически использует дагон когда у вражеского героя мало здоровья.
//Автоматически расчитывает маг. резист, уровень дагона.
//Распространяется под лицензией "GNU General Public License" https://jxself.org/translations/gpl-2.ru.shtml

//ВНИМАНИЕ, НЕ СЧИТАЕТ УСИЛЕНИЕ СПОМОБНОСТЕЙ, TODO

var interval = 0.1
var damage = [400,500,600,700,800]
var manacost = [35,30,25,20,15]
var manacoste = 100
var rangee = 1100
var range = [600,650,700,750,800]
var rangeCast  
var DagonLvl = -1
var ItemDagon = -1
var ItemBlink = -1
var Lense = false
var cast

var IgnoreBuffs = [
	//"modifier_abaddon_borrowed_time",
	"modifier_brewmaster_primal_split",
	"modifier_omniknight_repel",
	"modifier_phoenix_supernova_hiding",
	"modifier_tusk_snowball_movemEnemyEntity",
	"modifier_tusk_snowball_movemEnemyEntity_friendly",
	"modifier_juggernaut_blade_fury",
	"modifier_medusa_stone_gaze",
	"modifier_nyx_assassin_spiked_carapace",
	"modifier_templar_assassin_refraction_absorb",
	"modifier_oracle_false_promise",
	"modifier_dazzle_shallow_grave",
	"modifier_treant_living_armor",
	"modifier_life_stealer_rage",
	"modifier_item_aegis"
]

var DebuffsAddMagicDmg = [
	["modifier_bloodthorn_debuff", 1.3],
	["modifier_orchid_malevolence_debuff", 1.3],
	["modifier_item_mask_of_madness_berserk", 1.25],
	["modifier_bloodseeker_bloodrage", [1.25,1.3,1.35,1.4]],
	["modifier_ursa_enrage", 0.2],
]


var BuffsAbsorbMagicDmg = [
	["modifier_item_pipe_barrier", 400],
	["modifier_item_hood_of_defiance_barrier", 400],
	["modifier_item_infused_raindrop", 120],
	["modifier_abaddon_aphotic_shield", [110,140,170,200]],
	["modifier_ember_spirit_flame_guard", [50,200,350,500]]
]
var BuffsAddMagicDmgForMe = [
	["modifier_bloodseeker_bloodrage", [1.25,1.3,1.35,1.4]]
] 

function DagonStealerF(){
	if ( !DagonStealer.checked )
		return
	var Me = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var Ulti = Entities.GetAbility(Me, 3)
	$.Msg(Abilities.GetCastRange(Ulti))
	if (Game.GetAbilityByName(Me,'item_dagon') != -1) 
	{
		ItemDagon = Game.GetAbilityByName(Me,'item_dagon')
		DagonLvl = 0
	}
	if (Game.GetAbilityByName(Me,'item_dagon_2') != -1) 
	{
		ItemDagon = Game.GetAbilityByName(Me,'item_dagon_2')
		DagonLvl = 1
	}
	if (Game.GetAbilityByName(Me,'item_dagon_3') != -1)
	{
		ItemDagon = Game.GetAbilityByName(Me,'item_dagon_3')
		DagonLvl = 2
	}
	if (Game.GetAbilityByName(Me,'item_dagon_4') != -1) 
	{
		ItemDagon = Game.GetAbilityByName(Me,'item_dagon_4')
		DagonLvl = 3
	}
	if (Game.GetAbilityByName(Me,'item_dagon_5') != -1)
	{
		ItemDagon = Game.GetAbilityByName(Me,'item_dagon_5')
		DagonLvl = 4
	}
	if (ItemDagon == -1)
		return
	if (Game.GetAbilityByName(Me, 'item_aether_lens') !=-1)
		Lense = true
	else
		Lense = false
	if ( Abilities.GetCooldownTimeRemaining(ItemDagon) != 0 || Entities.GetMana(Me) < manacost[DagonLvl] )
		return
	if (Lense){
		rangeCast = 200 + range[DagonLvl]
	} else
	{
		rangeCast = range[DagonLvl]		
	}
	var MagicDamage = damage[DagonLvl]
	MyPos = Entities.GetAbsOrigin(Me)
	var HEnts = Game.PlayersHeroEnts()
	for (i in HEnts) {
		ent = HEnts[i]
		entPos = Entities.GetAbsOrigin(ent)
		cast = true
		if(ent==Me)
			continue	
		if (Game.PointDistance(entPos,MyPos) >  rangeCast) {
			cast = false
		}
		if (cast){
			var buffsnames = Game.GetBuffsNames(ent)
			if ( !Entities.IsEnemy(ent) || Entities.IsMagicImmune(ent) || !Entities.IsAlive(ent) || Game.IntersecArrays(buffsnames, IgnoreBuffs) || Entities.GetAllHeroEntities().indexOf(ent)==-1 )
				continue
			var MagicResist = Entities.GetArmorReductionForDamageType( ent, 2 )*100
			var buffs = Game.GetBuffs(ent)
			for(m in buffs)
				for(k in DebuffsAddMagicDmg)
					if(Buffs.GetName(ent,buffs[m]) === DebuffsAddMagicDmg[k][0])
						if(Array.isArray(DebuffsAddMagicDmg[k][1]))
							MagicDamage *= DebuffsAddMagicDmg[k][1][Abilities.GetLevel(Buffs.GetAbility(ent,buffs[i]))-1]
						else
							MagicDamage *= DebuffsAddMagicDmg[k][1]
			var buffsme = Game.GetBuffs(Me)
			for(m in buffsme)
				for(k in BuffsAddMagicDmgForMe)
					if(Buffs.GetName(ent,buffsme[m]) === BuffsAddMagicDmgForMe[k][0])
						if(Array.isArray(BuffsAddMagicDmgForMe[k][1]))
							MagicDamage *= BuffsAddMagicDmgForMe[k][1][Abilities.GetLevel(buffsme.GetAbility(ent,buffsme[i]))-1]
						else
							MagicDamage *= BuffsAddMagicDmgForMe[k][1]
			for(m in buffs)
				for(k in BuffsAbsorbMagicDmg)
					if(Buffs.GetName(ent,buffs[m]) === BuffsAbsorbMagicDmg[k][0])
						if(Array.isArray(BuffsAbsorbMagicDmg[k][1]))
							MagicDamage -= BuffsAbsorbMagicDmg[k][1][Abilities.GetLevel(buffs.GetAbility(ent,buffs[i]))-1]
						else
							MagicDamage -= BuffsAddMagicDmgForMe[k][1]
						
			if (Lense)
				MagicDamage = MagicDamage * 1.05

			var dmgclear = MagicDamage - MagicDamage/100*MagicResist
			var HP = Entities.GetHealth(ent)
			if ( HP <= dmgclear ){
				Game.CastTarget(Me, ItemDagon,ent,false)
				$.Msg(HP,'<',dmgclear)
			}
			cast = false
		}

	}
}


var DagonStealerOnCheckBoxClick = function(){
	if ( !DagonStealer.checked ){
		Game.ScriptLogMsg('Скрипт отключен: DagonStealer', '#ff0000')
		return
	}
	//циклически замкнутый таймер с проверкой условия с интервалом 'interval'
	function f(){ $.Schedule( interval,function(){
		DagonStealerF()
		if(DagonStealer.checked)
			f()
	})}
	f()
	Game.ScriptLogMsg('Скрипт активирован: DagonStealer', '#00ff00')
}

//шаблонное добавление чекбокса в панель
var Temp = $.CreatePanel( "Panel", $('#scripts'), "DagonStealer" )
Temp.SetPanelEvent( 'onactivate', DagonStealerOnCheckBoxClick )
Temp.BLoadLayoutFromString( '<root><styles><include src="s2r://panorama/styles/dotastyles.vcss_c" /><include src="s2r://panorama/styles/magadan.vcss_c" /></styles><Panel><ToggleButton class="CheckBox" id="DagonStealer" text="DagonStealer"/></Panel></root>', false, false)  
var DagonStealer = $.GetContextPanel().FindChildTraverse( 'DagonStealer' ).Children()[0]

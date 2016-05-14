class AbstractAtom
{
	ion(charge)
	{
		return new Atom(this.element, this.mass, charge);
	}
	
	iso(mass)
	{
		return new Atom(this.element, mass, this.charge);
	}
	
	get shells()
	{
		return getShell(this.number);
	}
	
	get shell()
	{
		var shells = this.shells;
		return shells[shells.length - 1];
	}
	
	toString()
	{
		return this.name;
	}
}

class Atom extends AbstractAtom
{
	constructor(element, mass, charge)
	{
		super();
		
		this.element = element instanceof Element ? element : findElement(element);
		this.number = element.number;
		this.symbol = element.symbol;
		this.name = element.name;
		this.mass = mass || element.mass;
		this.charge = charge || 0;
		
		this.protons = this.number;
		this.electrons = this.number - this.charge;
		this.neutrons = Math.round(mass - this.protons);
		
		if(this.mass != element.mass)
		{
			let disp = '-' + Math.round(this.mass);
			
			this.symbol += disp;
			this.name += disp;
		}
		
		if(this.charge != 0)
		{
			let disp = '<sup>' + (this.charge != 1 ? this.charge : '') + (this.charge > 0 ? '+' : '-') + '</sup>';
			
			this.symbol += disp;
			this.name += disp;
		}
	}
}

class Element extends AbstractAtom
{
	constructor(number, symbol, name, mass)
	{
		super();
		
		this.number = number;
		this.symbol = symbol;
		this.name = name;
		this.mass = mass;
		
		this.protons = this.electrons = this.number;
		this.neutrons = Math.round(mass - this.protons);
		
		this.element = this;
	}
}

var shellTypes =
[
	{label: 's', max: 2},
	{label: 'p', max: 6},
	{label: 'd', max: 10},
	{label: 'f', max: 14},
	{label: 'g', max: 18},
];

function getShell(number)
{
	var shellIndex = 0;
	var level = 1;
	var result = [];
	while(number > 0)
	{
		var shell = shellTypes[shellIndex];
		
		number -= shell.max;
		result.push(level + shell.label + '<sup>' + (number < 0 ? shell.max + number : shell.max) + '</sup>');
		
		shellIndex++;
		if(shellIndex > level - 1 || shellIndex == shellTypes.length)
		{
			level++;
			shellIndex = 0;
		}
	}
	return result;
}

var elementLookup = {};

function addElement(number, symbol, name, mass)
{
	var element = new Element(number, symbol, name, mass);
	
	elementLookup[number] = element;
	elementLookup[symbol.toLowerCase()] = element;
	elementLookup[name.toLowerCase()] = element;
	
	return element;
}

function findElement(selector)
{
	if(selector)
	{
		return elementLookup[selector.toString().toLowerCase()];
	}
}

findElement.populate = (callback) =>
{
	for(var i = 1; i <= 118; i++) callback(elementLookup[i]);
}

addElement(1, 'H', 'Hydrogen', 1.008);
addElement(2, 'He', 'Helium', 4.002602);
addElement(3, 'Li', 'Lithium', 6.94);
addElement(4, 'Be', 'Beryllium', 9.0121831);
addElement(5, 'B', 'Boron', 10.81);
addElement(6, 'C', 'Carbon', 12.011);
addElement(7, 'N', 'Nitrogen', 14.007);
addElement(8, 'O', 'Oxygen', 15.999);
addElement(9, 'F', 'Fluorine', 18.998403163);
addElement(10, 'Ne', 'Neon', 20.1797);
addElement(11, 'Na', 'Sodium', 22.98976928);
addElement(12, 'Mg', 'Magnesium', 24.305);
addElement(13, 'Al', 'Aluminium', 26.9815385);
addElement(14, 'Si', 'Silicon', 28.085);
addElement(15, 'P', 'Phosphorus', 30.973761998);
addElement(16, 'S', 'Sulfur', 32.06);
addElement(17, 'Cl', 'Chlorine', 35.45);
addElement(18, 'Ar', 'Argon', 39.948);
addElement(19, 'K', 'Potassium', 39.0983);
addElement(20, 'Ca', 'Calcium', 40.078);
addElement(21, 'Sc', 'Scandium', 44.955908);
addElement(22, 'Ti', 'Titanium', 47.867);
addElement(23, 'V', 'Vanadium', 50.9415);
addElement(24, 'Cr', 'Chromium', 51.9961);
addElement(25, 'Mn', 'Manganese', 54.938044);
addElement(26, 'Fe', 'Iron', 55.845);
addElement(27, 'Co', 'Cobalt', 58.933194);
addElement(28, 'Ni', 'Nickel', 58.6934);
addElement(29, 'Cu', 'Copper', 63.546);
addElement(30, 'Zn', 'Zinc', 65.38);
addElement(31, 'Ga', 'Gallium', 69.723);
addElement(32, 'Ge', 'Germanium', 72.63);
addElement(33, 'As', 'Arsenic', 74.921595);
addElement(34, 'Se', 'Selenium', 78.971);
addElement(35, 'Br', 'Bromine', 79.904);
addElement(36, 'Kr', 'Krypton', 83.798);
addElement(37, 'Rb', 'Rubidium', 85.4678);
addElement(38, 'Sr', 'Strontium', 87.62);
addElement(39, 'Y', 'Yttrium', 88.90584);
addElement(40, 'Zr', 'Zirconium', 91.224);
addElement(41, 'Nb', 'Niobium', 92.90637);
addElement(42, 'Mo', 'Molybdenum', 95.95);
addElement(43, 'Tc', 'Technetium', 98);
addElement(44, 'Ru', 'Ruthenium', 101.07);
addElement(45, 'Rh', 'Rhodium', 102.90550);
addElement(46, 'Pd', 'Palladium', 106.42);
addElement(47, 'Ag', 'Silver', 107.8682);
addElement(48, 'Cd', 'Cadmium', 112.414);
addElement(49, 'In', 'Indium', 114.818);
addElement(50, 'Sn', 'Tin', 118.710);
addElement(51, 'Sb', 'Antimony', 121.760);
addElement(52, 'Te', 'Tellurium', 127.60);
addElement(53, 'I', 'Iodine', 126.90447);
addElement(54, 'Xe', 'Xenon', 131.293);
addElement(55, 'Cs', 'Caesium', 132.90545196);
addElement(56, 'Ba', 'Barium', 137.327);
addElement(57, 'Hf', 'Hafnium', 178.49);
addElement(58, 'Ta', 'Tantalum', 180.94788);
addElement(59, 'W', 'Tungsten', 183.84);
addElement(60, 'Re', 'Rhenium', 186.207);
addElement(61, 'Os', 'Osmium', 190.23);
addElement(62, 'Ir', 'Iridium', 192.217);
addElement(63, 'Pt', 'Platinum', 195.084);
addElement(64, 'Au', 'Gold', 196.966569);
addElement(65, 'Hg', 'Mercury', 200.59);
addElement(66, 'Tl', 'Thallium', 204.38);
addElement(67, 'Pb', 'Lead', 207.2);
addElement(68, 'Bi', 'Bismuth', 208.98040);
addElement(69, 'Po', 'Polonium', 209);
addElement(70, 'At', 'Astatine', 210);
addElement(71, 'Rn', 'Radon', 222);
addElement(72, 'Fr', 'Francium', 223);
addElement(73, 'Ra', 'Radium', 226);
addElement(74, 'Rf', 'Rutherfordium', 267);
addElement(75, 'Db', 'Dubnium', 268);
addElement(76, 'Sg', 'Seaborgium', 271);
addElement(77, 'Bh', 'Bohrium', 272);
addElement(78, 'Hs', 'Hassium', 270);
addElement(79, 'Mt', 'Meitnerium', 276);
addElement(80, 'Ds', 'Darmstadtium', 281);
addElement(81, 'Rg', 'Roentgenium', 280);
addElement(82, 'Cn', 'Copernicium', 285);
addElement(83, 'Uut', 'Ununtrium', 284);
addElement(84, 'Fl', 'Flerovium', 289);
addElement(85, 'Uup', 'Ununpentium', 288);
addElement(86, 'Lv', 'Livermorium', 293);
addElement(87, 'Uus', 'Ununseptium', 294);
addElement(88, 'Uuo', 'Ununoctium', 294);
addElement(89, 'La', 'Lanthanum', 138.90547);
addElement(90, 'Ce', 'Cerium', 140.116);
addElement(91, 'Pr', 'Praseodymium', 140.90766);
addElement(92, 'Nd', 'Neodymium', 144.242);
addElement(93, 'Pm', 'Promethium', 145);
addElement(94, 'Sm', 'Samarium', 150.36);
addElement(95, 'Eu', 'Europium', 151.964);
addElement(96, 'Gd', 'Gadolinium', 157.25);
addElement(97, 'Tb', 'Terbium', 158.92535);
addElement(98, 'Dy', 'Dysprosium', 162.500);
addElement(99, 'Ho', 'Holmium', 164.93033);
addElement(100, 'Er', 'Erbium', 167.259);
addElement(101, 'Tm', 'Thulium', 168.93422);
addElement(102, 'Yb', 'Ytterbium', 173.054);
addElement(103, 'Lu', 'Lutetium', 174.9668);
addElement(104, 'Ac', 'Actinium', 227);
addElement(105, 'Th', 'Thorium', 232.0377);
addElement(106, 'Pa', 'Protactinium', 231.03588);
addElement(107, 'U', 'Uranium', 238.02891);
addElement(108, 'Np', 'Neptunium', 237);
addElement(109, 'Pu', 'Plutonium', 244);
addElement(110, 'Am', 'Americium', 243);
addElement(111, 'Cm', 'Curium', 247);
addElement(112, 'Bk', 'Berkelium', 247);
addElement(113, 'Cf', 'Californium', 251);
addElement(114, 'Es', 'Einsteinium', 252);
addElement(115, 'Fm', 'Fermium', 257);
addElement(116, 'Md', 'Mendelevium', 258);
addElement(117, 'No', 'Nobelium', 259);
addElement(118, 'Lr', 'Lawrencium', 262);
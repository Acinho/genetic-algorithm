import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  nazivNoveNamirnice: string = '';
  kolicinaNoveNamirnice: number;
  brojKalorijaNoveNamirnice: number;

  dozvoljenaKaloricnaVrednost: number = 1500;
  frizider: Namirnica[] = [
    { naziv: 'Ananas', kolicina: 100, brojKalorija: 95 },
    { naziv: 'Banana', kolicina: 300, brojKalorija: 240 },
    { naziv: 'Jabuka', kolicina: 150, brojKalorija: 60 },
    { naziv: 'Lubenica', kolicina: 200, brojKalorija: 40 },
    { naziv: 'Hleb', kolicina: 300, brojKalorija: 750 },
    { naziv: 'Piletina', kolicina: 300, brojKalorija: 360 },
    { naziv: 'Govedina', kolicina: 300, brojKalorija: 900 },
    { naziv: 'Musaka', kolicina: 500, brojKalorija: 750 },
    { naziv: 'Kobasica', kolicina: 200, brojKalorija: 700 },
    { naziv: 'Svinjetina', kolicina: 300, brojKalorija: 900 },
    { naziv: 'Corba', kolicina: 200, brojKalorija: 200 },
    { naziv: 'Paradajz', kolicina: 200, brojKalorija: 40 },
  ];

  optimalneNamirnice: Namirnica[] = [];

  ukupanBrojKalorija(namirnice: Namirnica[]): string {
    return `Ukupno kalorija: ${namirnice.length ? namirnice.map(x => x.brojKalorija).reduce((x, y) => x + y) : 0}`;
  }

  ukupnaKolicina(namirnice: Namirnica[]): string {
    return `Kolicina: ${namirnice.length ? namirnice.map(x => x.kolicina).reduce((x, y) => x + y) : 0} grama`;
  }

  dodajNamirnicu(namirnica: Namirnica): void {
    if (namirnica.brojKalorija && namirnica.kolicina && namirnica.naziv) {
      this.frizider.push(namirnica);
      this.nazivNoveNamirnice = '';
      this.kolicinaNoveNamirnice = undefined;
      this.brojKalorijaNoveNamirnice = undefined;
    }
  }

  ukloniNamirnicu(index: number): void {
    this.frizider.splice(index, 1);
  }

  generisiRezultat(): void {
    this.optimalneNamirnice.splice(0);
    const populacija: Populacija = new Populacija(100, this.frizider, this.dozvoljenaKaloricnaVrednost);
    populacija.izracunajDobrotuGena();
    const kriterijum: number = 2000;
    populacija.evolucija(kriterijum);

    populacija.geni[0].genotip.forEach((x, i) => {
      if (x)
        this.optimalneNamirnice.push(this.frizider[i]);
    });
  }

}

interface Namirnica {
  naziv: string;
  kolicina: number;
  brojKalorija: number;
}

class Gen {
  static readonly verovatnocaKombinacije = 0.8;
  static readonly verovatnocaMutacije = 0.2;

  genotip: boolean[];
  dobrota: number;
  generacija: number;

  generisiGenotip(namirnice: Namirnica[], dozvoljenaKaloricnaVrednost: number): void {
    this.genotip = Array(namirnice.length).fill(0);
    let ukupnoKalorija: number = 0;
    while (ukupnoKalorija < dozvoljenaKaloricnaVrednost) {
      const indeks: number = Math.floor(Math.random() * (namirnice.length - 1));
      if (!this.genotip[indeks]) {
        ukupnoKalorija += namirnice[indeks].brojKalorija;
        if (ukupnoKalorija >= dozvoljenaKaloricnaVrednost)
          break;
        this.genotip[indeks] = true;
      }
    }
  }

  izracunajDobrotu(namirnice: Namirnica[], dozvoljenaKaloricnaVrednost): void {
    const izabraneNamirnice: Namirnica[] = namirnice.filter((x, i) => this.genotip[i]);
    this.dobrota = izabraneNamirnice.length ? izabraneNamirnice.map(x => x.kolicina).reduce((x, y) => x + y) : 0;
    if (!izabraneNamirnice.length || izabraneNamirnice.map(x => x.brojKalorija).reduce((x, y) => x + y) > dozvoljenaKaloricnaVrednost)
      this.dobrota = 0;
  }

  rekombinacija(verovatnoca: number, drugiGen: Gen): Gen[] {
    if (verovatnoca >= Math.random()) {
      const tackaPrelaska = Math.floor(Math.random() * (this.genotip.length - 1));
      const prviDeoGenotipa1: boolean[] = this.genotip.slice(0, tackaPrelaska);
      const prviDeoGenotipa2: boolean[] = drugiGen.genotip.slice(0, tackaPrelaska);
      const drugiDeoGenotipa1: boolean[] = this.genotip.slice(tackaPrelaska);
      const drugiDeoGenotipa2: boolean[] = drugiGen.genotip.slice(tackaPrelaska);

      const prviPotomak: Gen = new Gen();
      const drugiPotomak: Gen = new Gen();
      prviPotomak.genotip = prviDeoGenotipa1.concat(drugiDeoGenotipa2);
      drugiPotomak.genotip = prviDeoGenotipa2.concat(drugiDeoGenotipa1);
      return [prviPotomak, drugiPotomak];
    }
    return [this, drugiGen];
  }

  mutacija(verovatnoca: number): void {
    for (let i = 0; i < this.genotip.length; i++)
      if (verovatnoca >= Math.random())
        this.genotip[i] = !this.genotip[i];
  }

  maksimum(): boolean {
    for (let i = 0; i < this.genotip.length; i++)
      if (!this.genotip[i])
        return false;
    return true;
  }
}

class Populacija {
  geni: Gen[] = [];
  generacija: number = 0;

  constructor(velicina: number, public namirnice: Namirnica[], public dozvoljenaKaloricnaVrednost: number) {
    for (let i = 0; i < velicina; i++) {
      const gen: Gen = new Gen();
      gen.generisiGenotip(namirnice, dozvoljenaKaloricnaVrednost);
      this.geni.push(gen);
    }
  }

  sortirajGene(): void {
    this.geni.sort((x, y) => y.dobrota - x.dobrota);
  }

  izracunajDobrotuGena(): void {
      this.geni.forEach(x => x.izracunajDobrotu(this.namirnice, this.dozvoljenaKaloricnaVrednost));
  }

  odaberiRoditelje(): Gen[] {
    this.sortirajGene();
    return [this.geni[0], this.geni[1]];
  }

  evolucija(kriterijum: number): void {
    while (this.geni[0].dobrota < kriterijum && this.generacija < 1000 && !this.geni[0].maksimum()) {
      this.generacija++;

      const roditelji: Gen[] = this.odaberiRoditelje();
      const potomci: Gen[] = roditelji[0].rekombinacija(Gen.verovatnocaKombinacije, roditelji[1]);

      this.geni.splice(this.geni.length - 2, 2, ...potomci);
      potomci[0].generacija = potomci[1].generacija = this.generacija;

      this.geni.forEach(x => x.mutacija(Gen.verovatnocaMutacije));

      this.izracunajDobrotuGena();
      this.sortirajGene();
      console.log(this.geni[0]);
    }
  }
}

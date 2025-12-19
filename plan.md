# Plan Projektu: scout-life-balance

## Wprowadzenie

**scout-life-balance** to gra edukacyjna przeznaczona głównie dla młodych instruktorów harcerskich (ale nie tylko). Ma na celu pokazanie wyzwań związanych z zarządzaniem czasem, priorytetami oraz energią życiową. Projekt jest realizowany w formie webowej aplikacji, działającej dobrze także na urządzeniach mobilnych.

---

## Cel Projektu

* **Edukacja**: Pomóc młodym instruktorom harcerskim zrozumieć, jak decyzje dnia codziennego wpływają na różne obszary ich życia.
* **Praktyka**: Zaoferować narzędzie wspomagające kursy szkoleniowe i warsztaty harcerskie.
* **Rozrywka**: Zapewnić prostą, przyjemną w odbiorze rozgrywkę z elementami grywalizacji (zbieranie jak najdłuższego „stażu”, liczonego w tygodniach).

---

## Opis gry

W grze gracz podejmuje decyzje, przesuwając karty w lewo lub prawo (mechanika tzw. *swipe*). Każda karta reprezentuje określoną sytuację z życia instruktora harcerskiego i wpływa na cztery zasoby:

* **Rodzina i przyjaciele**
* **Drużyna (harcerstwo)**
* **Szkoła (nauka)**
* **Energia**

Za każdym razem, gdy którykolwiek zasób spadnie do zera, gra zostaje zakończona z odpowiednim komunikatem fabularnym. Kluczowym wyzwaniem jest utrzymanie względnej równowagi między różnymi aspektami życia.

---

## Mechanika gry

1. **Początkowe zasoby**

   * Każda rozgrywka startuje ze średnim poziomem 50/100 w każdym z czterech obszarów.
2. **Przebieg rozgrywki**

   * Gracz otrzymuje serię kart, każda karta reprezentuje jeden *dzień* w życiu bohatera.
   * Każda karta ma dwie możliwe odpowiedzi (przesunięcie w lewo/prawo), modyfikujące zasoby gracza.
   * Kolejność kart jest losowa. Każde pytanie pojawia się tylko raz na rozgrywkę.
3. **Zmiany zasobów**

   * Wpływ decyzji na zasoby wyrażany jest liczbowo (np. +5 do Rodziny i przyjaciół, −10 do Energii). Skala 0–20 punktów jednorazowej zmiany jest rozważana jako docelowa.
   * Paski postępu (0–100) prezentują aktualny poziom zasobu. Spadek do 0 kończy grę.
   * Obecnie wszystkie wartości w przykładowych pytaniach mają charakter poglądowy i będą jeszcze *balansowane*.
4. **Kończenie gry**

   * Jeśli którykolwiek zasób spadnie do zera, rozgrywka kończy się porażką gracza, wyświetlając *tematyczny komunikat* (np. w przypadku spadku Harcerstwa: „Twoja gromada lub drużyna się rozpadła, a ty zostałeś sam.”).
   * Głównym celem jest przetrwanie jak najdłużej – liczone w dniach.
5. **Tryby rozgrywki**

   * **Wolny** – gracz wchodzi do gry i gra do momentu utraty któregoś z zasobów (można grać dowolną ilość razy).
   * **Kursowy** – wyniki i wybory są zapisywane do bazy danych; tryb przeznaczony do analizy zachowań graczy (instruktorów) w ramach kursów.

---

## Wstępne założenia UX/UI

Poniższe wytyczne przedstawiają wstępną wizję wyglądu oraz interakcji w aplikacji. W projekcie MVP wszystko zostanie zaprezentowane w sposób możliwie minimalistyczny, tak aby później można było łatwo wprowadzić zmiany stylistyczne lub kontynuować rozwój z pomocą UX/UI designera.

1. **Ekran startowy**

   * Cztery główne przyciski:

     * **Graj** (bez logowania)
     * **Gra kursowa** (z logowaniem i wprowadzeniem specjalnego kodu)
     * **Dla prowadzących zajęcia** (sekcja informacyjna, generowanie kodów)
     * **Instrukcja** (zwięzły opis zasad i obsługi gry)
   * Styl minimalistyczny: wyłącznie podstawowe kolory, proste tło, niewielkie ilustracje lub ikony.

2. **Karty (ekran rozgrywki)**

   * **Layout**: wygląd „swipe Tinder-like” — przesunięcie w lewo/prawo ujawnia wybór.
   * **Treść**: obrazek (tematyczny lub uniwersalny) plus krótki opis sytuacji.
   * **Podpowiedź wpływu**: gdy gracz zaczyna przesuwać kartę, na odpowiednich paskach zasobów pojawiają się strzałki (w górę lub w dół), proporcjonalne do przewidywanej zmiany.
   * **Animacje**: proste przesunięcia kart; brak zbędnych wibracji czy podskoków.

3. **Paski zasobów**

   * Zlokalizowane w dolnej części ekranu.
   * Każdy pasek ma własną ikonę i nazwę (np. serce dla Rodziny, tarczę dla Harcerstwa, itp.).
   * Brak wyświetlania konkretnych wartości liczbowych (np. 50/100) — sam pasek wizualizuje poziom.
   * Przy zwiększaniu zasobu pasek wyświetla krótko zieloną animację, przy spadku — czerwoną.

4. **Ekran końcowy / komunikat o przegranej**

   * Wyświetla się komunikat: „Udało ci się przetrwać n tygodni!”
   * Informacja o zasobie, który spadł do zera, np. „Twoja drużyna się rozpadła...”
   * Przyciski:

     * **Zagraj ponownie** (rozpoczyna nową rozgrywkę)
     * **Wyjdź** (powrót do ekranu startowego)
   * W trybie kursowym opcja: **„Zakończ i wyślij rozgrywkę”** (zapis do bazy i wyjście).

5. **Responsywność / Mobile-first**

   * Projekt tworzony z myślą o urządzeniach mobilnych w orientacji pionowej.
   * W trybie desktopowym karty będą wycentrowane, a paski zasobów mogą być np. w poziomej linii na dole.

6. **Kolorystyka i styl**

   * Wstępnie bardzo **minimalistyczny**: podstawowe kolory, brak dodatkowych grafik.
   * Możliwość łatwej wymiany palety barw i grafik w kolejnych fazach (wsparcie UX/UI designera).

## Plan implementacji

### Faza I
1. Implementacja "Graj" i "Instrukcja" bez opcji Kursowej


## Technologie
- React
- Typescript
- Redux
- Framer Motion (Motion)
- Vite
- Tailwind


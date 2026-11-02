package pkg;

import java.util.Scanner;

public class UserInputAndArithmetics {

	public static void main(String[] args) {
		
		String Name;
		
		Scanner s = new Scanner(System.in);
		
		System.out.print("What is your name? ");
		Name = s.nextLine();
		s.close();
		
		System.out.print("\nHello, "+Name);
	}

}
